/**
 * UIHandlers
 * ----------
 * Rôle : ne gérer QUE le DOM et les événements "interface".
 * - met en cache les éléments jQuery dans this.uiElements
 * - branche les handlers simples (helper de nom, reset, etc.)
 * - délègue l'export/clear au StudentManager
 */
class UIHandlers {
    constructor(app) {
        this.app = app;

        // On attend que le DOM soit prêt AVANT d'interroger le document.
        $(document).ready(() => {
            // Cache des éléments, pour éviter de redemander jQuery à chaque action
            this.uiElements = this._cacheSelectors(AppConfig.SELECTORS);

            // Affiche la constante métier (âge mini) dans la page
            $(AppConfig.SELECTORS.minAgeLabel).text(AppConfig.MIN_AGE);

            // Branche les événements d'interface
            this.bindEvents();
        });
    }

    /** Construit un dictionnaire {clé: jQueryElement} à partir d'un objet {clé: selector}. */
    _cacheSelectors(selectors) {
        const elements = {};
        for (const key in selectors) {
            elements[key] = $(selectors[key]);
        }
        return elements;
    }

    /** Branche les handlers UI (pas de logique métier ici). */
    bindEvents() {
        const el = this.uiElements;

        el.fullName.on('input blur', () => this.refreshNameHelper());
        el.lastCount.on('change', () => this.updatePreview());
        el.clearTable.on('click', () => this.app.manager.clearTable());
        el.resetForm.on('click', () => this.resetForm());

        el.btnHelp.on('click', () => this.openHelp());
        el.btnHelpClose.on('click', () => this.closeHelp());
        el.btnHelpOk.on('click', () => this.closeHelp());

        el.helpOverlay.on('click', (e) => {
            if (e.target === el.helpOverlay[0]) this.closeHelp(); // clic en dehors
        });

        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') this.closeHelp();
        });
    }

    /**
     * Affiche/alimente le helper de découpe prénom/nom :
     * - génère les options 1..(n-1)
     * - heuristique (petites particules FR) pour une valeur par défaut
     * - affiche un aperçu "Prénom(s) | Nom"
     */
    refreshNameHelper() {
        const el = this.uiElements;
        const tokens = Utils.tokenizeName(el.fullName.val());

        if (tokens.length <= 2) return el.nameHelper.addClass('d-none');

        // options : 1 à tokens.length - 1
        el.lastCount.empty();
        for (let i = 1; i < tokens.length; i++) {
            el.lastCount.append($('<option>').val(i).text(`${i} mot${i > 1 ? 's' : ''}`));
        }

        // Heuristique : particule "de/du/des/d'/le/la/les/van/von" -> nom sur 2 mots
        const particles = ['de', 'du', 'des', "d'", 'le', 'la', 'les', 'van', 'von'];
        const last2 = tokens.slice(-2).map(t => t.toLowerCase());
        let defaultLc = particles.includes(last2[0]) ? 2 : 1;
        if (defaultLc >= tokens.length) defaultLc = 1;
        el.lastCount.val(String(defaultLc));

        // Aperçu live
        this.updatePreview();
        el.nameHelper.removeClass('d-none');
    }

    /** Met à jour "Prénom(s): X | Nom: Y" selon la valeur courante de lastCount. */
    updatePreview() {
        const el = this.uiElements;
        const tokens = Utils.tokenizeName(el.fullName.val());
        const lc = parseInt(el.lastCount.val(), 10) || 1;
        const preview = Utils.buildNamePreview(tokens, lc);
        el.namePreview.text(`Prénom(s): ${preview.first} | Nom: ${preview.last}`);
    }

    /** Reset cosmétique du formulaire (ne vide pas forcément toutes les valeurs). */
    resetForm() {
        const el = this.uiElements;
        const formEl = el.form;
        formEl.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        el.namePreview.text('');
        el.nameHelper.addClass('d-none');
    }


    openHelp() {
        const el = this.uiElements;
        el.helpOverlay.removeClass('d-none').attr('aria-hidden', 'false');
    }

    closeHelp() {
        const el = this.uiElements;
        el.helpOverlay.addClass('d-none').attr('aria-hidden', 'true');
    }

}
