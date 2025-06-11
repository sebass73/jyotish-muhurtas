import L from "leaflet";
import 'leaflet/dist/leaflet.css';

export default class MapDisplay {
  constructor(selector) {
    this.el = document.querySelector(selector);
    this.map = null;
  }
  update(lat, lng, city, country) {
    if (this.map) this.map.remove();
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
