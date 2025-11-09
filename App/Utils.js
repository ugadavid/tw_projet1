class Utils {
  static tokenizeName(full) {
    return full.trim().split(/\s+/).filter(Boolean);
  }

  static buildNamePreview(tokens, lastCount) {
    if (tokens.length === 0) return { first: '', last: '' };
    const lc = Math.min(Math.max(1, lastCount || 1), Math.max(1, tokens.length - 1));
    return {
      first: tokens.slice(0, tokens.length - lc).join(' '),
      last: tokens.slice(-lc).join(' ')
    };
  }

  static anonymizeEmail(email) {
    const at = email.indexOf('@');
    if (at === -1) return email;
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);
    return (local.charAt(0) || '*') + '****@' + domain;
  }

  static validateGradesString(str) {
    const re = /^\s*\d{1,2}(,\d+)?\s*(;\s*\d{1,2}(,\d+)?\s*)*$/;
    if (!re.test(str)) return false;
    const nums = str.split(';').map(s => parseFloat(s.trim().replace(',', '.')));
    return nums.every(n => !isNaN(n) && n >= 0 && n <= 20);
  }

  static parseGrades(str) {
    return str.split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => parseFloat(s.replace(',', '.')));
  }

  static mean(nums) {
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : NaN;
  }

  static fmtFR(n) { return String(n).replace('.', ','); }

  static validBirth(value, minAge) {
    if (!value) return { ok: false, msg: 'Date requise.' };
    const today = new Date();
    const d = new Date(value + 'T00:00:00');
    if (d > today) return { ok: false, msg: 'Date dans le futur.' };
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    if (age < minAge) return { ok: false, msg: `Âge minimum ${minAge} ans.` };
    return { ok: true };
  }
}
