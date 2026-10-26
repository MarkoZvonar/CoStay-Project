const form = document.getElementById("form");
const poruka = document.getElementById("poruka");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  poruka.textContent = "Slanje...";

  const podaci = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(podaci),
    });
    const rezultat = await res.json();

    if (res.ok) {
      poruka.style.color = "green";
      poruka.textContent = "Uspješna registracija! Provjeri tablicu KORISNIK u Supabaseu.";
      form.reset();
    } else {
      poruka.style.color = "red";
      poruka.textContent = "Greška: " + rezultat.error;
    }
  } catch (err) {
    poruka.style.color = "red";
    poruka.textContent = "Greška mreže: " + err.message;
  }
});

//Na submit forme zaustavlja standardno slanje (e.preventDefault()).
//Skuplja sva polja u objekt (FormData → Object.fromEntries).
//Šalje ih kao JSON na POST /auth/register.
//Prikazuje poruku: zelenu pri uspjehu (i prazni formu), crvenu s tekstom greške pri neuspjehu.
