let map;
let marker;
let circle;
let selectedCoordinates = null;

async function initMap() {
    const mapElement = document.getElementById("map");
    const autocompleteContainer = document.getElementById("autocomplete-container");

    if (!mapElement || !autocompleteContainer) {
        console.error("Nedostaje element za kartu ili pretraživanje.");
        return;
    }

    const { Map } = await google.maps.importLibrary("maps");
    const { PlaceAutocompleteElement } =
        await google.maps.importLibrary("places");
    const { AdvancedMarkerElement } =
        await google.maps.importLibrary("marker");

    map = new Map(mapElement, {
        center: { lat: 45.8150, lng: 15.9819 },
        zoom: 12,
        mapId: "DEMO_MAP_ID",
        mapTypeControl: false,
        streetViewControl: false
    });

    const autocomplete = new PlaceAutocompleteElement();

    autocompleteContainer.appendChild(autocomplete);


    autocomplete.addEventListener("gmp-select", async (event) => {
        try {
            // Dohvati odabrani prijedlog
            const placePrediction = event.placePrediction;

            if (!placePrediction) {
                console.error("Nije pronađena odabrana lokacija.");
                return;
            }

            // Pretvori prijedlog u Place objekt
            const place = placePrediction.toPlace();

            // Dohvati potrebne podatke
            await place.fetchFields({
                fields: [
                    "displayName",
                    "location",
                    "viewport"
                ]
            });

            if (!place.location) {
                console.error("Lokacija nema dostupne koordinate.");
                return;
            }

            // Postavi marker, kružnicu i spremi koordinate
            selectLocation(
                place.location,
                place.displayName
            );

            // Ako postoji viewport, prilagodi prikaz karte
            if (place.viewport) {
                map.fitBounds(place.viewport);
            }

            console.log("Odabrano mjesto:", place.displayName);
            console.log("Latitude:", place.location.lat());
            console.log("Longitude:", place.location.lng());

        } catch (error) {
            console.error("Greška pri odabiru lokacije:", error);
        }
    });

    map.addListener("click", function(event) {
        selectLocation(event.latLng);
    });

    function selectLocation(position, title = "Odabrana lokacija") {
        const radius = Number(document.getElementById("radius").value);

        const lat = typeof position.lat === "function"
            ? position.lat()
            : position.lat;

        const lng = typeof position.lng === "function"
            ? position.lng()
            : position.lng;

        // Spremi koordinate
        selectedCoordinates = { lat, lng };

        console.log("Odabrane koordinate:", selectedCoordinates);

        // Ažuriraj skrivene inpute
        document.getElementById("latitude").value = lat;
        document.getElementById("longitude").value = lng;

        // Pomakni kartu
        map.setCenter({ lat, lng });

        // Ukloni stari marker
        if (marker) {
            marker.map = null;
        }

        // Postavi novi marker
        marker = new AdvancedMarkerElement({
            map,
            position: { lat, lng },
            title
        });

        // Ukloni staru kružnicu
        if (circle) {
            circle.setMap(null);
        }

        // Nacrtaj kružnicu radijusa 10 km
        circle = new google.maps.Circle({
            map,
            center: { lat, lng },
            radius: radius == 0 ? 10000 : radius * 1000, // default radius 10 km
            clickable: false,
            strokeColor: "#4285F4",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#4285F4",
            fillOpacity: 0.15
        });
    }

    const radiusInput = document.getElementById("radius");

    radiusInput.addEventListener("input", updateCircleRadius);
}

function updateCircleRadius() {
    const radiusInput = document.getElementById("radius");

    if (!circle || !radiusInput) return;

    const radiusKm = Number(radiusInput.value);

    if (radiusKm <= 0 || !Number.isFinite(radiusKm)) return;

    // Google Maps očekuje radijus u metrima
    circle.setRadius(radiusKm * 1000);
}
