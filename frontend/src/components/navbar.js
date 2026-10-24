fetch("../components/navbar.html")
  .then((odgovor) => odgovor.text())
  .then((html) => {
    document.getElementById("navbar").innerHTML = html;
  })
  .catch((greska) => {
    console.error("Greška pri učitavanju navigacije:", greska);
  });

fetch("../components/navbar.html")
  .then((odgovor) => odgovor.text())
  .then((html) => {
    document.getElementById("navbar").innerHTML = html;
    const trenutnaStranica = window.location.pathname.split("/").pop();
    const poveznice = document.querySelectorAll("#navbar .traka a");
    poveznice.forEach((poveznica) => {
      const odredisnaStranica = poveznica.getAttribute("href");
      if (odredisnaStranica === trenutnaStranica) {
        poveznica.classList.add("aktivna");
      }
    });
  })
  .catch((greska) => {
    console.error("Greška pri učitavanju navigacije:", greska);
  });
