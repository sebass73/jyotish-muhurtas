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
  update(lat, lng, city, country) {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }

    this.map = L.map(this.el).setView([lat, lng], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);
    
    L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(`${city}, ${country}`)
      .openPopup();
  }
}
