class UIHandlers {
  constructor(app) {
    this.app = app;

    $(document).ready(() => {
      this.uiElements = this._cacheSelectors(AppConfig.SELECTORS);
      $(AppConfig.SELECTORS.minAgeLabel).text(AppConfig.MIN_AGE);
      this.bindEvents();
    });
  }

  _cacheSelectors(selectors) {
    const elements = {};
    for (const key in selectors) {
      elements[key] = $(selectors[key]);
    }
    return elements;
  }

  bindEvents() {
    const el = this.uiElements;

    el.fullName.on('input blur', () => this.refreshNameHelper());
    el.lastCount.on('change', () => this.updatePreview());
    el.exportCsv.on('click', () => this.app.manager.exportCSV());
    el.clearTable.on('click', () => this.app.manager.clearTable());
    el.resetForm.on('click', () => this.resetForm());
  }

  refreshNameHelper() {
    const el = this.uiElements;
    const tokens = Utils.tokenizeName(el.fullName.val());

    if (tokens.length <= 2) return el.nameHelper.addClass('d-none');

    el.lastCount.empty();
    for (let i = 1; i < tokens.length; i++) {
      el.lastCount.append($('<option>').val(i).text(`${i} mot${i > 1 ? 's' : ''}`));
    }

    const particles = ['de', 'du', 'des', "d'", 'le', 'la', 'les', 'van', 'von'];
    const last2 = tokens.slice(-2).map(t => t.toLowerCase());
    let defaultLc = particles.includes(last2[0]) ? 2 : 1;
    if (defaultLc >= tokens.length) defaultLc = 1;
    el.lastCount.val(String(defaultLc));

    this.updatePreview();
    el.nameHelper.removeClass('d-none');
  }

  updatePreview() {
    const el = this.uiElements;
    const tokens = Utils.tokenizeName(el.fullName.val());
    const lc = parseInt(el.lastCount.val(), 10) || 1;
    const preview = Utils.buildNamePreview(tokens, lc);
    el.namePreview.text(`Prénom(s): ${preview.first} | Nom: ${preview.last}`);
  }

  resetForm() {
    const el = this.uiElements;
    const formEl = el.form;
    formEl.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    el.nameHelper.addClass('d-none');
  }
}
