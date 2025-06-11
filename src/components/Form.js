export default class Form {
  constructor(selector) {
    this.el = document.querySelector(selector);
    this.el.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(this.el);
      const params = {};
      fd.forEach((v, k) => (params[k] = v));
      this.onSubmitCallback && this.onSubmitCallback(params);
    });
  }
  onSubmit(fn) {
    this.onSubmitCallback = fn;
  }
  showError(msg) {
    /* TODO: implementar UI de error */
  }
}
