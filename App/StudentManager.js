class StudentManager {
  constructor(app) {
    this.app = app;
    this.sortState = { key: null, dir: 1 };

    $(document).ready(() => {
      this.uiElements = app.ui.uiElements;
      this.bindForm();
      this.bindSorting();
    });
  }

  bindForm() {
    this.uiElements.form.on('submit', e => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();
    const formEl = this.uiElements.form;
    let ok = true;

    formEl.find('input').each(function() {
      const valid = this.checkValidity();
      $(this).toggleClass('is-invalid', !valid).toggleClass('is-valid', valid);
      if (!valid) ok = false;
    });

    const birthVal = $('#birth').val();
    const birthChk = Utils.validBirth(birthVal, AppConfig.MIN_AGE);
    $('#birth').toggleClass('is-invalid', !birthChk.ok).toggleClass('is-valid', birthChk.ok);
    if (!birthChk.ok) {
      $('#birthFeedback').text(birthChk.msg);
      ok = false;
    }

    const gradesStr = $('#grades').val().trim();
    const gradesValid = Utils.validateGradesString(gradesStr);
    $('#grades').toggleClass('is-invalid', !gradesValid).toggleClass('is-valid', gradesValid);
    if (!gradesValid) ok = false;

    if (!ok) return;

    const tokens = Utils.tokenizeName($('#fullName').val());
    let { first, last } = Utils.buildNamePreview(tokens, parseInt($('#lastCount').val(), 10) || 1);
    if (tokens.length === 1) { first = tokens[0]; last = ''; }

    const emailMasked = Utils.anonymizeEmail($('#email').val().trim());
    const numbers = Utils.parseGrades(gradesStr);
    const color = $('#rowColor').val();

    const data = {
      first, last,
      emailMasked,
      birth: birthVal,
      count: numbers.length,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      avgNum: Utils.mean(numbers),
      color
    };

    this.addRow(data);

    if (this.sortState.key) this.renderSorted();

    formEl[0].reset();
    formEl.find('.is-valid').removeClass('is-valid');
    $('#rowColor').val(color);
    this.uiElements.nameHelper.addClass('d-none');
  }

  addRow(data) {
    const tableBodyEl = this.uiElements.tableBody;
    const tr = $('<tr>').css('background-color', data.color || '');
    tr.data('record', data);

    const delBtn = $('<button class="btn btn-sm btn-outline-danger">Supprimer</button>')
      .on('click', () => tr.remove());
    const swatch = $('<span class="swatch me-2">').css('background-color', data.color || '#fff');

    tr.append($('<td>').text(data.first));
    tr.append($('<td>').text(data.last));
    tr.append($('<td>').text(data.emailMasked));
    tr.append($('<td>').text(data.birth));
    tr.append($('<td class="text-center">').text(data.count));
    tr.append($('<td class="text-center">').text(Utils.fmtFR(data.min)));
    tr.append($('<td class="text-center">').text(Utils.fmtFR(data.max)));
    tr.append($('<td class="text-center">').text(Number.isFinite(data.avgNum) ? Utils.fmtFR(data.avgNum.toFixed(2)) : ''));
    tr.append($('<td>').append(swatch).append(document.createTextNode(data.color || '')));
    tr.append($('<td>').append(delBtn));

    tableBodyEl.append(tr);
  }

  clearTable() {
    this.uiElements.tableBody.empty();
  }

  exportCSV() {
    const headers = ['Prenom','Nom','Email (anonymise)','Date de naissance','#','Min','Max','Moyenne','Couleur'];
    const rows = this.uiElements.tableBody.find('tr').map(function() {
      const r = $(this).data('record');
      if (!r) return null;
      return [
        r.first, r.last, r.emailMasked, r.birth,
        String(r.count),
        r.min?.toString().replace('.', ',') || '',
        r.max?.toString().replace('.', ',') || '',
        Number.isFinite(r.avgNum) ? r.avgNum.toFixed(2).replace('.', ',') : '',
        r.color || ''
      ];
    }).get();

    const csv = [headers.join(';')]
      .concat(rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    $('<a>')
      .attr({ href: url, download: 'eleves.csv' })
      .appendTo('body')[0].click();
    URL.revokeObjectURL(url);
  }

  bindSorting() {
    this.uiElements.table.find('thead th.sortable').on('click', e => this.handleSortClick(e));
  }

  handleSortClick(e) {
    const key = $(e.currentTarget).data('key');
    if (this.sortState.key === key) this.sortState.dir *= -1;
    else this.sortState = { key, dir: 1 };
    this.clearIndicators();
    $(e.currentTarget).find('.sort-indicator').text(this.sortState.dir === 1 ? '▲' : '▼');
    this.renderSorted();
  }

  renderSorted() {
    const rows = this.uiElements.tableBody.find('tr').get().map(tr => ({ el: tr, rec: $(tr).data('record') }));
    const { key, dir } = this.sortState;
    if (!key) return;
    rows.sort((ra, rb) => dir * this.compare(ra.rec, rb.rec, key));
    this.uiElements.tableBody.empty().append(rows.map(r => r.el));
  }

  compare(a, b, key) {
    if (['count', 'min', 'max', 'avgNum'].includes(key))
      return Number(a[key]) - Number(b[key]);
    if (key === 'birth') return a[key].localeCompare(b[key]);
    return String(a[key]).localeCompare(String(b[key]), 'fr', { sensitivity: 'base' });
  }

  clearIndicators() {
    this.uiElements.table.find('thead .sort-indicator').text('');
  }
}
