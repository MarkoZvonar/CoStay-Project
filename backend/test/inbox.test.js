import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createInboxRouter } from "../src/routes/inbox.js";

const user = "6985ac2b-2bf6-494d-8830-739ddaa6aab5";
const other = "22222222-2222-4222-8222-222222222222";
const conversation = "33333333-3333-4333-8333-333333333333";

async function fixture(options = {}) {
  const calls = [];
  const db = {
    auth: {
      getUser: async () => ({
        data: { user: { id: options.wrongIdentity ? other : user } },
        error: null,
      }),
    },
    from(table) {
      const call = { table, filters: [] };
      calls.push(call);
      const chain = {
        select(value) {
          call.select = value;
          return this;
        },
        eq(key, value) {
          call.filters.push([key, value]);
          return this;
        },
        in(key, value) {
          call.in = [key, value];
          return this;
        },
        order() {
          return this;
        },
        limit() {
          return this;
        },
        maybeSingle() {
          call.single = true;
          return this;
        },
        insert(value) {
          call.insert = value;
          return this;
        },
        then(resolve, reject) {
          let data;
          if (table === "KORISNIK")
            data = options.noProfile ? null : { id_korisnik: user };
          if (table === "SUGOVORNIK")
            data = call.single
              ? options.notMember
                ? null
                : { id_razgovor: conversation }
              : options.empty
                ? []
                : [{ id_razgovor: conversation }];
          if (table === "RAZGOVOR")
            data = call.single
              ? { id_razgovor: conversation }
              : [
                  {
                    id_razgovor: conversation,
                    sudionici: [
                      {
                        id_sugovornik: other,
                        korisnik: { ime: "Ana", prezime: "Anić" },
                      },
                    ],
                    zadnja: [
                      { poruka: "Bok", vrijeme_slanja: "2026-11-02T12:00:00Z" },
                    ],
                  },
                ];
          if (table === "PORUKA")
            data = call.insert
              ? null
              : [
                  {
                    id_poruka: "2",
                    id_posiljatelj: other,
                    poruka: "Odgovor",
                    vrijeme_slanja: "2026-11-02T12:01:00Z",
                  },
                  {
                    id_poruka: "1",
                    id_posiljatelj: user,
                    poruka: "Bok",
                    vrijeme_slanja: "2026-11-02T12:00:00Z",
                  },
                ];
          const error = options.dbError ? { code: options.dbError } : null;
          return Promise.resolve({ data, error }).then(resolve, reject);
        },
      };
      return chain;
    },
  };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = options.guest
      ? {}
      : {
          user: { id: user },
          supabaseAccessToken: options.noToken ? undefined : "test-token",
        };
    next();
  });
  app.use(
    "/api/inbox",
    createInboxRouter(() => db),
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  return {
    calls,
    request: (path, init) =>
      fetch(`http://127.0.0.1:${server.address().port}/api/inbox${path}`, init),
    close: () => new Promise((resolve) => server.close(resolve)),
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

test("guest and sessions without Supabase token are rejected", async () => {
  for (const options of [
    { guest: true },
    { noToken: true },
    { wrongIdentity: true },
  ]) {
    await run(options, async (f) => {
      assert.equal((await f.request("/razgovori")).status, 401);
      assert.equal(f.calls.length, 0);
    });
  }
});
test("missing auth-linked profile has an actionable response", async () => {
  await run({ noProfile: true }, async (f) =>
    assert.equal((await f.request("/razgovori")).status, 409),
  );
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
