document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Zaustavlja osvježavanje stranice

  const formData = new FormData(e.target);
  const podaci = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(podaci),
    });

    if (response.redirected) {
      // Ako je backend poslao redirect, pratimo ga
      window.location.href = response.url;
    } else if (response.ok) {
      // Ako backend vrati običan status, ručno preusmjeravamo na profil
      window.location.href = "/profile";
    } else {
      const rezultat = await response.json();
      alert(rezultat.error || "Došlo je do pogreške.");
    }
  } catch (err) {
    console.error("Greška:", err);
    alert("Došlo je do pogreške prilikom komunikacije s poslužiteljem.");
  }
});
