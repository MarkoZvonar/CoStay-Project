import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { fileURLToPath } from "node:url";

// Testni proces koristi isključivo izmišljeni Supabase projekt.
process.env.SUPABASE_URL = "https://costay-test.invalid";
process.env.SUPABASE_ANON_KEY = "test-key";
const { default: inboxRouter } = await import("../src/routes/inbox.js");
const { default: apiRouter } = await import("../src/routes/api.js");
const originalFetch = globalThis.fetch;

const user = "6985ac2b-2bf6-494d-8830-739ddaa6aab5";
const other = "22222222-2222-4222-8222-222222222222";
const third = "44444444-4444-4444-8444-444444444444";
const conversation = "33333333-3333-4333-8333-333333333333";

async function fixture(options = {}) {
  const calls = [];
  const korisnikId = options.memberId || user;
  const clanovi = [
    { id: user, ime: "Marko", prezime: "Test" },
    { id: other, ime: "Ana", prezime: "Anić" },
  ];
  if (options.group) clanovi.push({ id: third, ime: "Ivan", prezime: "Ivić" });
  const poruke = [
    { id_poruka: "2", id_posiljatelj: other, poruka: "Odgovor", vrijeme_slanja: "2026-11-02T12:01:00Z" },
    { id_poruka: "1", id_posiljatelj: user, poruka: "Bok", vrijeme_slanja: "2026-11-02T12:00:00Z" },
  ];
  if (options.group) poruke.unshift({
    id_poruka: "3", id_posiljatelj: third, poruka: "Pozdrav grupi", vrijeme_slanja: "2026-11-02T12:02:00Z",
  });
  // Presrećemo Supabase HTTP zahtjeve. Upiti prema lokalnom Expressu idu normalno.
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.hostname !== "costay-test.invalid") {
      if (url.hostname !== "127.0.0.1") throw new Error("Neočekivani vanjski zahtjev");
      return originalFetch(input, init);
    }
    if (url.pathname === "/auth/v1/user") {
      return Response.json({
        id: options.wrongIdentity ? other : korisnikId,
        email: "marko@example.test",
        email_confirmed_at: "2026-01-01T00:00:00Z",
      });
    }
    const table = decodeURIComponent(url.pathname.split("/").pop());
    const call = { table, filters: [] };
    for (const [key, value] of url.searchParams) {
      if (value.startsWith("eq.")) call.filters.push([key, value.slice(3)]);
      if (value.startsWith("in.(")) call.in = [key, value.slice(4, -1).split(",")];
    }
    call.select = url.searchParams.get("select");
    if (init.method === "POST") call.insert = JSON.parse(init.body);
    calls.push(call);
    if (options.dbError && (!options.errorTable || options.errorTable === table)) return Response.json({ code: options.dbError, message: "Testna greška" }, { status: 400 });

    let data;
    if (table === "KORISNIK") data = options.noProfile ? [] : [{
      id_korisnik: korisnikId, ime: "Marko", prezime: "Test", email: "marko@example.test",
      datum_rodenja: "2000-01-01", spol: "muški", mjesto_stanovanja: "Zagreb",
      uloga: "registrirani_korisnik", status_korisnickog_racuna: "aktivan",
    }];
    if (table === "SUGOVORNIK") {
      const clan = clanovi.some((osoba) => osoba.id === korisnikId);
      data = options.empty || options.notMember || !clan ? [] : [{ id_razgovor: conversation }];
    }
    if (table === "RAZGOVOR") data = [{
      id_razgovor: conversation,
      razgovor_tip: options.group ? "grupni" : "izravan",
      sudionici: clanovi.map((osoba) => ({
        id_sugovornik: osoba.id,
        korisnik: { ime: osoba.ime, prezime: osoba.prezime },
      })),
      zadnja: [{ poruka: "Bok", vrijeme_slanja: "2026-11-02T12:00:00Z" }],
    }];
    if (table === "RAZGOVOR") {
      data = data.filter((redak) => call.filters.every(([key, value]) => redak[key] === value));
    }
    if (table === "PORUKA") {
      if (call.insert) {
        poruke.unshift({ ...call.insert, id_poruka: "4", vrijeme_slanja: "2026-11-02T12:03:00Z" });
        return new Response(null, { status: 201 });
      }
      data = poruke.map((poruka) => {
        const autor = clanovi.find((osoba) => osoba.id === poruka.id_posiljatelj);
        return { ...poruka, posiljatelj: autor ? { ime: autor.ime, prezime: autor.prezime } : null };
      });
    }
    if (!data) throw new Error(`Neočekivana tablica: ${table}`);
    return Response.json(data);
  };
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", fileURLToPath(new URL("../../frontend/src/pages/", import.meta.url)));
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = options.guest
      ? {}
      : {
          user: { id: korisnikId },
          accessToken: options.noToken ? undefined : "test-token",
        };
    next();
  });
  app.use("/api", apiRouter);
  app.use("/inbox", inboxRouter);
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
  } catch (error) {
    globalThis.fetch = originalFetch;
    throw error;
  }
  return {
    calls,
    request: (path, init) =>
      fetch(`http://127.0.0.1:${server.address().port}/inbox${path}`, { redirect: "manual", ...init }),
    page: () => fetch(`http://127.0.0.1:${server.address().port}/inbox`),
    close: () => new Promise((resolve) => server.close(() => {
      globalThis.fetch = originalFetch;
      resolve();
    })),
  };
}
async function run(options, check) {
  const f = await fixture(options);
  try {
    await check(f);
  } finally {
    await f.close();
  }
}

test("guest is redirected and invalid sessions are rejected", async () => {
  for (const options of [
    { guest: true },
    { noToken: true },
    { wrongIdentity: true },
  ]) {
    await run(options, async (f) => {
      assert.equal((await f.request("/razgovori")).status, options.guest ? 302 : 401);
      assert.equal(f.calls.length, 0);
    });
  }
});
test("missing auth-linked profile has an actionable response", async () => {
  await run({ noProfile: true }, async (f) => {
    const response = await f.request("/razgovori");
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "/signup2");
  });
});
test("empty inbox does not query messages", async () => {
  await run({ empty: true }, async (f) => {
    assert.deepEqual(await (await f.request("/razgovori")).json(), {
      razgovori: [],
    });
    assert.ok(!f.calls.some((c) => c.table === "PORUKA"));
  });
});
test("conversation listing is scoped to own memberships", async () => {
  await run({}, async (f) => {
    const body = await (await f.request("/razgovori")).json();
    assert.equal(body.razgovori[0].naziv, "Ana Anić");
    assert.deepEqual(f.calls.find((c) => c.table === "SUGOVORNIK").filters, [
      ["id_sugovornik", user],
    ]);
    assert.deepEqual(f.calls.find((c) => c.table === "RAZGOVOR").in, [
      "id_razgovor",
      [conversation],
    ]);
  });
});
test("nonmember cannot read or write a known conversation", async () => {
  await run({ notMember: true }, async (f) => {
    for (const method of ["GET", "POST"]) {
      const r = await f.request(`/razgovori/${conversation}/poruke`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ sadrzaj: "Bok" }) : undefined,
      });
      assert.equal(r.status, 404);
    }
    assert.ok(!f.calls.some((c) => c.table === "PORUKA"));
  });
});
test("messages are returned chronologically with ownership", async () => {
  await run({}, async (f) => {
    const body = await (
      await f.request(`/razgovori/${conversation}/poruke`)
    ).json();
    assert.deepEqual(
      body.poruke.map((p) => [p.sadrzaj, p.moja]),
      [
        ["Bok", true],
        ["Odgovor", false],
      ],
    );
  });
});
test("sender and conversation come from validated server context", async () => {
  await run({}, async (f) => {
    const r = await f.request(`/razgovori/${conversation}/poruke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sadrzaj: "  Bok!  ",
        id_posiljatelj: other,
        id_razgovor: other,
      }),
    });
    assert.equal(r.status, 201);
    assert.deepEqual(f.calls.find((c) => c.insert).insert, {
      id_razgovor: conversation,
      id_posiljatelj: user,
      poruka: "Bok!",
    });
  });
});
test("invalid IDs, empty/oversized text and form submissions are rejected", async () => {
  await run({}, async (f) => {
    assert.equal((await f.request("/razgovori/not-an-id/poruke")).status, 400);
    for (const sadrzaj of [" ", "x".repeat(2001), 123]) {
      assert.equal(
        (
          await f.request(`/razgovori/${conversation}/poruke`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sadrzaj }),
          })
        ).status,
        400,
      );
    }
    assert.equal(
      (
        await f.request(`/razgovori/${conversation}/poruke`, {
          method: "POST",
          body: "sadrzaj=bok",
        })
      ).status,
      415,
    );
    assert.ok(!f.calls.some((c) => c.insert));
  });
});
test("missing timestamp column returns setup error without database details", async () => {
  await run({ dbError: "42703" }, async (f) => {
    const r = await f.request("/razgovori");
    assert.equal(r.status, 503);
    assert.match((await r.json()).error, /SQL/);
  });
});
test("recursive membership policy returns an actionable error", async () => {
  await run({ dbError: "42P17" }, async (f) => {
    const r = await f.request("/razgovori");
    assert.equal(r.status, 503);
    assert.match((await r.json()).error, /pravilima pristupa/);
  });
});

test("direct router renders the inbox page at /inbox", async () => {
  await run({}, async (f) => {
    const response = await f.page();
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /id="porukaObrazac"/);
    assert.match(html, /id="razgovoriLista"/);
  });
});

test("message query errors never return successful reads or writes", async () => {
  await run({ dbError: "42501", errorTable: "PORUKA" }, async (f) => {
    const read = await f.request(`/razgovori/${conversation}/poruke`);
    assert.equal(read.status, 500);
    const write = await f.request(`/razgovori/${conversation}/poruke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sadrzaj: "Bok" }),
    });
    assert.equal(write.status, 500);
    assert.ok(!(await write.json()).success);
  });
});

test("group is listed for each of its three members with participants", async () => {
  for (const memberId of [user, other, third]) {
    await run({ group: true, memberId }, async (f) => {
      const response = await f.request("/razgovori");
      assert.equal(response.status, 200);
      const { razgovori } = await response.json();
      assert.equal(razgovori.length, 1);
      assert.equal(razgovori[0].grupni, true);
      assert.match(razgovori[0].naziv, /^Grupa/);
      assert.equal(razgovori[0].sudionici.length, 3);
    });
  }
});

test("each group member can read authors and send under their own identity", async () => {
  for (const memberId of [user, other, third]) {
    await run({ group: true, memberId }, async (f) => {
      const path = `/razgovori/${conversation}/poruke`;
      const response = await f.request(path);
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.grupni, true);
      assert.deepEqual(body.poruke.map((p) => p.posiljatelj), ["Marko Test", "Ana Anić", "Ivan Ivić"]);
      assert.equal(body.poruke.filter((p) => p.moja).length, 1);
      const sent = await f.request(path, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sadrzaj: "Nova grupna poruka", id_posiljatelj: "podmetnuti-ID" }),
      });
      assert.equal(sent.status, 201);
      assert.equal(f.calls.find((c) => c.insert).insert.id_posiljatelj, memberId);
      const refreshed = await (await f.request(path)).json();
      assert.equal(refreshed.poruke.at(-1).sadrzaj, "Nova grupna poruka");
      assert.equal(refreshed.poruke.at(-1).moja, true);
    });
  }
});

test("outsider cannot list, read or send to a group", async () => {
  const outsider = "55555555-5555-4555-8555-555555555555";
  await run({ group: true, memberId: outsider }, async (f) => {
    assert.deepEqual(await (await f.request("/razgovori")).json(), { razgovori: [] });
    const path = `/razgovori/${conversation}/poruke`;
    assert.equal((await f.request(path)).status, 404);
    const response = await f.request(path, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sadrzaj: "Nedopuštena poruka" }),
    });
    assert.equal(response.status, 404);
    assert.ok(!f.calls.some((c) => c.table === "PORUKA"));
  });
});
