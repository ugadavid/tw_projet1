/**
 * StudentManager
 * --------------
 * Rôle : logique métier et données (pas d'interrogation du DOM hors cache fourni par UIHandlers).
 * - branche le submit du formulaire (validation HTML5 + règles métiers)
 * - calcule les stats, crée la ligne, gère la suppression
 * - tri des colonnes et export CSV
 */
class StudentManager {
    constructor(app) {
        this.app = app;
        // État du tri courant (clé + direction)
        this.sortState = { key: null, dir: 1 };

        // On attend le DOM ready pour récupérer le cache d'UIHandlers
        $(document).ready(() => {
            this.uiElements = app.ui.uiElements;
            this.bindForm();
        });
    }

    /** Branche le submit du formulaire sur handleSubmit. */
    bindForm() {
        this.uiElements.form.on('submit', e => this.handleSubmit(e));
    }

    /**
     * Handler de soumission :
     * - validation HTML5 (classes is-invalid/is-valid)
     * - validation date/âge et notes (Utils)
     * - calculs statistiques
     * - ajout d'une ligne
     * - tri réappliqué si actif
     */
    handleSubmit(e) {
        e.preventDefault();
        const formEl = this.uiElements.form;
        let ok = true;

        // 1) Validation HTML5 de base sur tous les <input>
        formEl.find('input').each(function() {
            const valid = this.checkValidity();
            $(this).toggleClass('is-invalid', !valid).toggleClass('is-valid', valid);
            if (!valid) ok = false;
        });

        // 2) Règles métiers : date de naissance
        const birthVal = $('#birth').val();
        const birthChk = Utils.validBirth(birthVal, AppConfig.MIN_AGE);
        $('#birth').toggleClass('is-invalid', !birthChk.ok).toggleClass('is-valid', birthChk.ok);
        if (!birthChk.ok) {
            $('#birthFeedback').text(birthChk.msg);
            ok = false;
        }

        // 3) Règles métiers : notes
        const gradesStr = $('#grades').val().trim();
        const gradesValid = Utils.validateGradesString(gradesStr);
        $('#grades').toggleClass('is-invalid', !gradesValid).toggleClass('is-valid', gradesValid);
        if (!gradesValid) ok = false;

        if (!ok) return;    // stop si invalid

        // 4) Données métier
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

        // 5) Ajout et tri éventuel
        this.addRow(data);
        if (this.sortState.key) this.renderSorted();

        // 6) Reset doux
        formEl[0].reset();
        formEl.find('.is-valid').removeClass('is-valid');
        $('#rowColor').val(color);
        this.uiElements.nameHelper.addClass('d-none');
    }

    /** Crée et insère une ligne <tr> + data('record') pour tri/export. */
    addRow(data) {

        console.log('Ajout de la ligne:', data);
        const bg = data.color || '#ffffff';
        const fg = Utils.getTextColorForBackground(bg);

        const tableBodyEl = this.uiElements.tableBody;
        const tr = $('<tr>').css('background-color', data.color || '');
        tr.data('record', data);    // stocke l'objet brut, utile pour export/tri

        // Définir les variables CSS sur la ligne : les <td> hériteront
        tr[0].style.setProperty('--bs-table-bg', bg);
        tr[0].style.setProperty('--bs-table-color', fg);
        // (optionnel) si tu utilises .table-hover, fixe le hover pour éviter un changement
        tr[0].style.setProperty('--bs-table-hover-bg', bg);
        tr[0].style.setProperty('--bs-table-hover-color', fg);

        const delBtn = $('<button class="btn btn-sm btn-outline-danger">Supprimer</button>')
        .on('click', () => tr.remove());

        // Colonnes
        tr.append($('<td>').text(data.first));
        tr.append($('<td>').text(data.last));
        tr.append($('<td>').text(data.emailMasked));
        tr.append($('<td>').text(data.birth));
        tr.append($('<td class="text-center">').text(data.count));
        tr.append($('<td class="text-center">').text(Utils.fmtFR(data.min)));
        tr.append($('<td class="text-center">').text(Utils.fmtFR(data.max)));
        tr.append($('<td class="text-center">').text(Number.isFinite(data.avgNum) ? Utils.fmtFR(data.avgNum.toFixed(2)) : ''));

        tr.append($('<td>').append(delBtn));

        tableBodyEl.append(tr);
    }

    /** Vide le tableau. */
    clearTable() {
        this.uiElements.tableBody.empty();
    }

    
}
