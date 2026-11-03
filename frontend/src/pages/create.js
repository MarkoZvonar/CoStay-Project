document.getElementById("createForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Zaustavlja osvježavanje stranice

  // Prikupljanje svih podataka iz forme po 'name' atributima
  const formData = new FormData(e.target);
  const podaci = Object.fromEntries(formData.entries());

  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(podaci),
  });

  const rezultat = await response.json();
  if (response.ok) {
    window.location.href = "/profile"; // Preusmjeravanje na Profile da korisnik odmah može vidjeti svoju novu objavu
  } else {
    alert(rezultat.error);
  }
});
