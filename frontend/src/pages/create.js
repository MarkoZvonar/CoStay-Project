document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Sprječava standardno osvježavanje stranice

  const errorAlert = document.getElementById("errorAlert");

  // Sakrij prethodnu grešku ako postoji
  if (errorAlert) {
    errorAlert.style.display = "none";
    errorAlert.textContent = "";
  }

  const formData = new FormData(e.target);
  const podaci = Object.fromEntries(formData.entries());

  // Validacija datuma na frontendu
  const datumDolaska = new Date(podaci.datumDolaska);
  const datumOdlaska = new Date(podaci.datumOdlaska);

  if (datumOdlaska <= datumDolaska) {
    if (errorAlert) {
      errorAlert.textContent =
        "Krivi unos: datum dolaska mora biti prije datuma odlaska.";
      errorAlert.style.display = "block";
      errorAlert.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("Krivi unos: datum dolaska mora biti prije datuma odlaska.");
    }
    return; // Preida slanje forme
  }

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(podaci),
    });

    if (response.redirected) {
      window.location.href = response.url;
    } else if (response.ok) {
      window.location.href = "/profile";
    } else {
      const rezultat = await response.json();
      if (errorAlert) {
        errorAlert.textContent = rezultat.error || "Došlo je do pogreške.";
        errorAlert.style.display = "block";
        errorAlert.scrollIntoView({ behavior: "smooth" });
      } else {
        alert(rezultat.error || "Došlo je do pogreške.");
      }
    }
  } catch (err) {
    console.error("Greška:", err);
    if (errorAlert) {
      errorAlert.textContent =
        "Došlo je do pogreške prilikom komunikacije s poslužiteljem.";
      errorAlert.style.display = "block";
      errorAlert.scrollIntoView({ behavior: "smooth" });
    } else {
      alert("Došlo je do pogreške prilikom komunikacije s poslužiteljem.");
    }
  }
});
