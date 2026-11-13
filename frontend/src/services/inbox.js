const { supabaseUrl, supabaseKey } = document.querySelector(".inboxTijelo").dataset;
const lista = document.getElementById("razgovoriLista");
const poruke = document.getElementById("porukeLista");
const naslov = document.getElementById("chatNaslov");
const sudionici = document.getElementById("chatSudionici");
const status = document.getElementById("inboxStatus");
const veza = document.getElementById("inboxVeza");
const slanjeStatus = document.getElementById("slanjeStatus");
const unos = document.getElementById("sadrzaj");
const posalji = document.getElementById("posalji");
let odabrani = null;
let ucitavanje = false;
let cekaOsvjezenje = false;
let salje = false;
let zadnjePoruke = "";
let zadnjiPopis = "";
let realtimeKanal = null;
let povezivanjeRealtime = false;

async function api(url, options = {}) {
  const odgovor = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  if (odgovor.redirected) {
    throw new Error("Za pristup inboxu prijavi se i dovrši profil.");
  }
  if (odgovor.status === 401) {
    throw new Error("Prijava je istekla. Ponovno se prijavi za pristup porukama.");
  }
  if (!odgovor.ok) {
    const podaci = odgovor.headers.get("content-type")?.includes("application/json")
      ? await odgovor.json()
      : {};
    throw new Error(podaci.error || "Zahtjev nije uspio. Pokušaj ponovno.");
  }
  return odgovor.json();
}

function prazno(element, tekst) {
  const p = document.createElement("p");
  p.className = "prazno";
  p.textContent = tekst;
  element.replaceChildren(p);
}

function prikaziZaglavlje() {
  naslov.textContent = odabrani?.naziv || "Odaberi razgovor";
  sudionici.hidden = !odabrani?.grupni;
  sudionici.textContent = odabrani?.grupni
    ? `Sudionika: ${odabrani.sudionici.length} · ${odabrani.sudionici.map((s) => s.ime).join(", ")}`
    : "";
}

function prikaziRazgovore(razgovori) {
  const potpis = JSON.stringify([razgovori, odabrani?.id]);
  if (potpis === zadnjiPopis) return;
  zadnjiPopis = potpis;
  lista.replaceChildren();
  if (!razgovori.length) return prazno(lista, "Još nemaš razgovora. Razgovori u kojima sudjeluješ prikazat će se ovdje.");
  for (const razgovor of razgovori) {
    const gumb = document.createElement("button");
    gumb.type = "button";
    gumb.className = "razgovor";
    gumb.setAttribute("aria-current", String(odabrani?.id === razgovor.id));
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = razgovor.grupni ? "👥" : razgovor.naziv.slice(0, 1).toUpperCase();
    const tekst = document.createElement("span");
    tekst.className = "razgovorTekst";
    const ime = document.createElement("strong");
    ime.textContent = razgovor.naziv;
    const pregled = document.createElement("small");
    pregled.textContent = razgovor.zadnjaPoruka || "Započni razgovor";
    tekst.append(ime, pregled);
    gumb.append(avatar, tekst);
    gumb.addEventListener("click", async () => {
      if (salje || odabrani?.id === razgovor.id) return;
      odabrani = razgovor;
      unos.value = "";
      unos.disabled = true;
      posalji.disabled = true;
      slanjeStatus.textContent = "";
      prikaziZaglavlje();
      zadnjePoruke = "";
      prikaziRazgovore(razgovori);
      prazno(poruke, "Učitavanje poruka…");
      try {
        await ucitajPoruke();
      } catch (error) { status.textContent = error.message; }
    });
    lista.append(gumb);
  }
}

async function ucitajPoruke() {
  if (!odabrani) return;
  const id = odabrani.id;
  const podaci = await api(`/inbox/razgovori/${encodeURIComponent(id)}/poruke`);
  // Spor odgovor prethodnog razgovora ne smije prepisati trenutačni razgovor.
  if (odabrani?.id !== id) return;
  const potpis = JSON.stringify([podaci.grupni, podaci.poruke]);
  if (potpis !== zadnjePoruke) {
    const priDnu = poruke.scrollHeight - poruke.scrollTop - poruke.clientHeight < 70;
    const prviPrikaz = !zadnjePoruke;
    poruke.replaceChildren();
    for (const poruka of podaci.poruke) {
      const element = document.createElement("article");
      element.className = poruka.moja ? "poruka moja" : "poruka";
      element.setAttribute("aria-label", poruka.moja ? "Tvoja poruka" : "Primljena poruka");
      if (podaci.grupni) {
        const autor = document.createElement("strong");
        autor.className = "porukaAutor";
        autor.textContent = poruka.moja ? "Ti" : poruka.posiljatelj;
        element.append(autor);
      }
      const tekst = document.createElement("p");
      tekst.textContent = poruka.sadrzaj;
      const vrijeme = document.createElement("time");
      vrijeme.dateTime = poruka.vrijeme;
      vrijeme.textContent = new Date(poruka.vrijeme).toLocaleString("hr-HR", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
      element.append(tekst, vrijeme);
      poruke.append(element);
    }
    if (!podaci.poruke.length) prazno(poruke, "Nema poruka. Pošalji prvu poruku!");
    if (priDnu || prviPrikaz) poruke.scrollTop = poruke.scrollHeight;
    zadnjePoruke = potpis;
  }
  unos.disabled = salje;
  posalji.disabled = salje;
  status.textContent = "";
}

async function osvjezi() {
  if (document.hidden) return;
  if (ucitavanje) {
    cekaOsvjezenje = true;
    return;
  }
  ucitavanje = true;
  try {
    const podaci = await api("/inbox/razgovori");
    const odabraniRazgovor = podaci.razgovori.find((r) => r.id === odabrani?.id);
    if (odabrani && !odabraniRazgovor) {
      odabrani = null;
      unos.value = "";
      unos.disabled = true;
      posalji.disabled = true;
      prazno(poruke, "Razgovor više nije dostupan.");
    } else if (odabraniRazgovor) {
      odabrani = odabraniRazgovor;
    }
    prikaziZaglavlje();
    prikaziRazgovore(podaci.razgovori);
    await ucitajPoruke();
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
    if (!lista.querySelector("button")) prazno(lista, "Razgovore trenutačno nije moguće učitati.");
  } finally {
    ucitavanje = false;
    if (cekaOsvjezenje) {
      cekaOsvjezenje = false;
      void osvjezi();
    }
  }
}

document.getElementById("porukaObrazac").addEventListener("submit", async (event) => {
  event.preventDefault();
  const sadrzaj = unos.value.trim();
  if (!odabrani || salje || !sadrzaj) return;
  salje = true;
  unos.disabled = true;
  posalji.disabled = true;
  slanjeStatus.textContent = "Slanje…";
  try {
    await api(`/inbox/razgovori/${encodeURIComponent(odabrani.id)}/poruke`, {
      method: "POST", body: JSON.stringify({ sadrzaj }),
    });
    unos.value = "";
    slanjeStatus.textContent = "Poruka je poslana.";
    await osvjezi();
  } catch (error) { slanjeStatus.textContent = error.message; }
  finally {
    salje = false;
    unos.disabled = !odabrani;
    posalji.disabled = !odabrani;
    if (odabrani) unos.focus();
  }
});
async function pokreniRealtime() {
  if (realtimeKanal || povezivanjeRealtime) return;
  povezivanjeRealtime = true;

  try {
    const klijent = window.supabase.createClient(supabaseUrl, supabaseKey, {
      accessToken: async () => {
        const { accessToken } = await api("/inbox/realtime-session");
        return accessToken;
      },
    });
    await klijent.realtime.setAuth();

    realtimeKanal = klijent.channel("inbox-poruke", {
      config: { postgres_changes_options: { wait: true } },
    });
    realtimeKanal
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "PORUKA" },
        () => void osvjezi(),
      )
      .subscribe((stanje) => {
        veza.hidden = stanje === "SUBSCRIBED";
        if (stanje === "SUBSCRIBED") void osvjezi();
        if (stanje === "CLOSED") {
          realtimeKanal = null;
          klijent.realtime.disconnect();
        }
      });
  } catch {
    realtimeKanal = null;
    veza.hidden = false;
  } finally {
    povezivanjeRealtime = false;
  }
}

function osvjeziInbox() {
  if (document.hidden) return;
  void pokreniRealtime();
  void osvjezi();
}

document.getElementById("osvjezi").addEventListener("click", osvjeziInbox);
document.addEventListener("visibilitychange", osvjeziInbox);
window.addEventListener("online", osvjeziInbox);
osvjeziInbox();
