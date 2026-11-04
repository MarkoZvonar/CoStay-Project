const unosTaga = document.getElementById("unosTaga");
const ponudeniTagovi = document.getElementById("ponudeniTagovi");
const dodajTag = document.getElementById("dodajTag");
const tagoviPoruka = document.getElementById("tagoviPoruka");
const listaTagova = document.getElementById("listaTagova");

let sviTagovi = [];

function showMessage(text) {
    tagoviPoruka.textContent = text;
    if (text === "") {
        tagoviPoruka.hidden = true;
    } else {
        tagoviPoruka.hidden = false;
    }
}

//dohvaca iz backenda sve tagove i dodaje ih na stranicu
async function getAllTags() {
    try {
        const response = await fetch("/profile/tags");
        if (response.redirected) {
            throw new Error("Potrebna je nova prijava.");
        }

        const data = await response.json();

        if(!response.ok) {
            throw new Error(data.error || "Dohvat ponuđenih tagova nije uspio.");
        }

        sviTagovi = data.tagovi;
        ponudeniTagovi.replaceChildren();

        sviTagovi.forEach((tag) => {
            const option = document.createElement("option");
            option.value = tag.ime_tag;
            ponudeniTagovi.appendChild(option);
        });
    } catch (error) {
        showMessage(error.message);
    }
}

function showTag(tag) {
    const span = document.createElement("span");
    span.className="tag";
    span.appendChild(document.createTextNode(tag.ime_tag));

    const gumb = document.createElement("button");
    gumb.id = tag.id_tag;
    gumb.className="ukloniTag";
    gumb.textContent = 'x';
    gumb.type="button";
    gumb.setAttribute("aria-label", "Ukloni " + tag.ime_tag);
    
    span.appendChild(gumb);
    listaTagova.appendChild(span);
}

dodajTag.addEventListener("click", async () => {
    showMessage("");

    //pronalazimo odabrani naziv medu tagovima dohvacenima iz baze
    const odabraniTag = sviTagovi.find((tag) => 
        tag.ime_tag === unosTaga.value.trim());

    if (!odabraniTag) {
        showMessage("Odaberi jedan od ponuđenih tagova.");
        return;
    }

    //ako je vec odabran na profilu zelimo da se samo jednom prikaze
    if(document.getElementById(odabraniTag.id_tag)) {
        unosTaga.value = "";
        return;
    }

    //onemogucimo vise puta klikanje add dok se ceka odgovor backenda
    dodajTag.disabled = true;

    try {
        const response = await fetch("/profile/tags", {
            method: "POST", 
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                id_tag: odabraniTag.id_tag
            })
        });

        if (response.redirected) {
            throw new Error("Potrebna je nova prijava.");
        } else if (!response.ok) {
            throw new Error("Dodavanje taga nije uspjelo.");
        }

        const data = await response.json();
        showTag(data.tag);
        unosTaga.value = "";
    } catch(error) {
        showMessage(error.message);
    } finally {
        dodajTag.disabled = false;
    }
});

listaTagova.addEventListener("click", async(event) => {
    const gumb = event.target.closest(".ukloniTag");
    
    if(!gumb) return;
    showMessage("");

    gumb.disabled = true;

    try {
        const response = await fetch("/profile/tags/" + gumb.id,
            {method: "DELETE"});

        if (response.redirected) {
            throw new Error("Potrebna je nova prijava.");
        } else if (!response.ok) {
            throw new Error("Uklanjanje taga nije uspjelo.");
        }

        gumb.closest(".tag").remove();
    } catch (error) {
        showMessage(error.message);
    } finally {
        gumb.disabled = false;
    }
});

getAllTags();