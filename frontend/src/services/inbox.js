// API vraća samo podatke potrebne inboxu; Supabase token ostaje u sesiji na serveru.
const lista = document.getElementById("razgovoriLista");
const poruke = document.getElementById("porukeLista");
const naslov = document.getElementById("chatNaslov");
const status = document.getElementById("inboxStatus");
const slanjeStatus = document.getElementById("slanjeStatus");
const unos = document.getElementById("sadrzaj");
const posalji = document.getElementById("posalji");
let odabrani = null;
let ucitavanje = false;
let salje = false;
let zadnjePoruke = "";
let povezivanjeNedovrseno = false;
let zadnjiPopis = "";

async function api(url, options = {}) {
  const odgovor = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  if (odgovor.status === 401) {
    povezivanjeNedovrseno = true;
    throw new Error("Prijava je istekla. Ponovno se prijavi za pristup porukama.");
  }
  if (!odgovor.ok) {
    const podaci = odgovor.headers.get("content-type")?.includes("application/json")
      ? await odgovor.json()
      : {};
    povezivanjeNedovrseno = odgovor.status === 503;
    throw new Error(podaci.error || "Zahtjev nije uspio. Pokušaj ponovno.");
  }
  povezivanjeNedovrseno = false;
  return odgovor.json();
}

function prazno(element, tekst) {
  const p = document.createElement("p");
  p.className = "prazno";
  p.textContent = tekst;
  element.replaceChildren(p);
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
    avatar.textContent = razgovor.naziv.slice(0, 1).toUpperCase();
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
      naslov.textContent = razgovor.naziv;
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
  const podaci = await api(`/api/inbox/razgovori/${encodeURIComponent(id)}/poruke`);
  // Spor odgovor prethodnog razgovora ne smije prepisati trenutačni razgovor.
  if (odabrani?.id !== id) return;
  const potpis = JSON.stringify(podaci.poruke);
  if (potpis !== zadnjePoruke) {
    const priDnu = poruke.scrollHeight - poruke.scrollTop - poruke.clientHeight < 70;
    const prviPrikaz = !zadnjePoruke;
    poruke.replaceChildren();
    for (const poruka of podaci.poruke) {
      const element = document.createElement("article");
      element.className = poruka.moja ? "poruka moja" : "poruka";
      element.setAttribute("aria-label", poruka.moja ? "Tvoja poruka" : "Primljena poruka");
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
  if (ucitavanje || document.hidden) return;
  ucitavanje = true;
  try {
    const podaci = await api("/api/inbox/razgovori");
    if (odabrani && !podaci.razgovori.some((r) => r.id === odabrani.id)) {
      odabrani = null;
      unos.value = "";
      unos.disabled = true;
      posalji.disabled = true;
      naslov.textContent = "Odaberi razgovor";
      prazno(poruke, "Razgovor više nije dostupan.");
    }
    prikaziRazgovore(podaci.razgovori);
    await ucitajPoruke();
    status.textContent = "";
  } catch (error) {
    status.textContent = error.message;
    if (!lista.querySelector("button")) prazno(lista, "Razgovore trenutačno nije moguće učitati.");
  }
  finally { ucitavanje = false; }
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
    await api(`/api/inbox/razgovori/${encodeURIComponent(odabrani.id)}/poruke`, {
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
document.getElementById("osvjezi").addEventListener("click", osvjezi);
document.addEventListener("visibilitychange", () => { if (!document.hidden) osvjezi(); });
osvjezi();
// Početna verzija koristi periodično osvježavanje. Realtime se može dodati naknadno.
setInterval(() => { if (!povezivanjeNedovrseno) osvjezi(); }, 5000);
