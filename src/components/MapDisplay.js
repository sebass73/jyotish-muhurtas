import L from "leaflet";
import "leaflet/dist/leaflet.css";

// importa las imágenes para que tu bundler las incluya
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// informa a Leaflet dónde encontrar los assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export default class MapDisplay {
  constructor(selector) {
    this.el = document.querySelector(selector);
    this.map = null;
  }
  clear() {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    this.el.innerHTML = "";
  }

  update(lat, lng, city, country) {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = null;
    }
    // Limpia el elemento para evitar "Map container is already initialized"
    this.el.innerHTML = "";

    this.map = L.map(this.el).setView([lat, lng], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);

    const capitalize = (s) => s
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : s;

    L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(`${capitalize(city)}, ${capitalize(country)}`)
      .openPopup();
  }
}
