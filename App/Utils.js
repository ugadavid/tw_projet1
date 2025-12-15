/**
 * Utils
 * -----
 * Fonctions pures et statiques (sans effet de bord).
 * Idéal pour les tests unitaires.
 */
class Utils {
    /** Découpe un "nom complet" en tokens non vides. */
    static tokenizeName(full) {
        return full.trim().split(/\s+/).filter(Boolean);
    }

    /**
     * Construit un preview {first,last} à partir de tokens et d'un "lastCount"
     * lastCount = nb de mots alloués au NOM (depuis la fin).
     */
    static buildNamePreview(tokens, lastCount) {
        if (tokens.length === 0) return { first: '', last: '' };
        const lc = Math.min(Math.max(1, lastCount || 1), Math.max(1, tokens.length - 1));
        return {
        first: tokens.slice(0, tokens.length - lc).join(' '),
        last: tokens.slice(-lc).join(' ')
        };
    }

    /** Masque l'email : conserve l'initiale et le domaine. */
    static anonymizeEmail(email) {
        const at = email.indexOf('@');
        if (at === -1) return email;
        const local = email.slice(0, at);
        const domain = email.slice(at + 1);
        return (local.charAt(0) || '*') + '****@' + domain;
    }

    /**
     * Valide la chaîne des notes au format FR :
     * - nombres 0..20, séparés par ';'
     * - virgule décimale autorisée (ex : "12,5")
     */
    static validateGradesString(str) {
        const re = /^\s*\d{1,2}(,\d+)?\s*(;\s*\d{1,2}(,\d+)?\s*)*$/;
        if (!re.test(str)) return false;
        const nums = str.split(';').map(s => parseFloat(s.trim().replace(',', '.')));
        return nums.every(n => !isNaN(n) && n >= 0 && n <= 20);
    }

    /** Parse la chaîne de notes en tableau de nombres JS. */
    static parseGrades(str) {
        return str.split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => parseFloat(s.replace(',', '.')));
    }

    /** Moyenne arithmétique, NaN si vide. */
    static mean(nums) {
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : NaN;
    }

    /** Format FR simple : remplace le point par une virgule (affichage). */
    static fmtFR(n) { 
        return String(n).replace('.', ','); 
    }

    /**
     * Valide la date de naissance :
     * - existe
     * - pas future
     * - respecte l’âge minimum
     */
    static validBirth(value, minAge) {
        if (!value) return { ok: false, msg: 'Date requise.' };

        const today = new Date();
        const d = new Date(value + 'T00:00:00');     // éviter TZ surprises

        if (d > today) return { ok: false, msg: 'Date dans le futur.' };

        // calcul d'âge (année/ mois/ jour)
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;

        if (age < minAge) return { ok: false, msg: `Âge minimum ${minAge} ans.` };
        return { ok: true };
    }


    static getTextColorForBackground(bgColor) {
        if (!bgColor) return '#000';
        const c = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000' : '#fff';
    }

}
