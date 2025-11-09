$(function(){
      const $form = $('#studentForm');
      const $table = $('#studentsTable');
      const $tableBody = $table.find('tbody');
      const $fullName = $('#fullName');
      const $lastCount = $('#lastCount');
      const $nameHelper = $('#nameSplitHelper');
      const $namePreview = $('#namePreview');
      const MIN_AGE = 16; // ajustable si besoin
      $('#minAgeLabel, #minAgeLabel2').text(MIN_AGE);

      // -- Helpers --
      function tokenizeName(full){
        return full.trim().split(/\s+/).filter(Boolean);
      }

      function buildNamePreview(tokens, lastCount){
        if(tokens.length === 0) return { first:'', last:'' };
        const lc = Math.min(Math.max(1, lastCount||1), Math.max(1,tokens.length-1));
        const first = tokens.slice(0, tokens.length - lc).join(' ');
        const last  = tokens.slice(-lc).join(' ');
        return { first, last };
      }

      function anonymizeEmail(email){
        const at = email.indexOf('@');
        if(at === -1) return email; // laisser tel quel si format inattendu
        const local = email.slice(0, at);
        const domain = email.slice(at + 1);
        const first = local.charAt(0) || '';
        return (first ? first : '*') + '****@' + domain; // ex: d****@uga.fr
      }

      function validateGradesString(str){
        const re = /^\s*\d{1,2}(,\d+)?\s*(;\s*\d{1,2}(,\d+)?\s*)*$/;
        if(!re.test(str)) return false;
        const nums = str.split(';').map(s => parseFloat(s.trim().replace(',', '.')));
        return nums.every(n => !isNaN(n) && n >= 0 && n <= 20);
      }

      function parseGrades(str){
        return str.split(';')
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => parseFloat(s.replace(',', '.')));
      }

      function mean(nums){
        if(!nums.length) return NaN;
        return nums.reduce((a,b)=>a+b,0)/nums.length;
      }

      function fmtFR(n){ return String(n).replace('.', ','); }

      function validBirth(value){
        if(!value) return false;
        const today = new Date();
        const d = new Date(value + 'T00:00:00');
        if(d > today) return { ok:false, msg:'La date ne peut pas être dans le futur.' };
        // calcul d'âge simple
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if(m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        if(age < MIN_AGE) return { ok:false, msg:'Âge minimum ' + MIN_AGE + ' ans.' };
        return { ok:true };
      }

      function addRow(data){
        const tr = $('<tr>');
        tr.css('background-color', data.color || '');
        tr.data('record', data); // conserver les valeurs brutes pour le tri/export

        const $delBtn = $('<button class="btn btn-sm btn-outline-danger">Supprimer</button>').on('click', function(){
          tr.remove();
        });

        const $swatch = $('<span class="swatch me-2">').css('background-color', data.color || '#fff');

        tr.append($('<td>').text(data.first));
        tr.append($('<td>').text(data.last));
        tr.append($('<td>').text(data.emailMasked));
        tr.append($('<td>').text(data.birth));
        tr.append($('<td class="text-center">').text(data.count));
        tr.append($('<td class="text-center">').text(data.min != null ? fmtFR(data.min) : ''));
        tr.append($('<td class="text-center">').text(data.max != null ? fmtFR(data.max) : ''));
        tr.append($('<td class="text-center">').text(Number.isFinite(data.avgNum) ? fmtFR(data.avgNum.toFixed(2)) : ''));
        tr.append($('<td>').append($swatch).append(document.createTextNode(data.color || '')));
        tr.append($('<td>').append($delBtn));

        $tableBody.append(tr);
      }

      // -- Gestion helper de nom multi-mots --
      function refreshNameHelper(){
        const tokens = tokenizeName($fullName.val());
        if(tokens.length <= 2){
          $nameHelper.addClass('d-none');
          return;
        }
        // proposer 1..(tokens.length-1)
        $lastCount.empty();
        for(let i=1; i<tokens.length; i++){
          $lastCount.append($('<option>').val(i).text(i + (i>1?' mots':' mot')));
        }
        // heuristique: si dernière particule française (ex: "de", "du", "des") alors nom sur 2 mots, sinon 1
        const particles = ['de','du','des','d\'','le','la','les','van','von'];
        const last2 = tokens.slice(-2).map(t=>t.toLowerCase());
        let defaultLc = particles.includes(last2[0]) ? 2 : 1;
        if(defaultLc >= tokens.length) defaultLc = 1;
        $lastCount.val(String(defaultLc));
        const preview = buildNamePreview(tokens, defaultLc);
        $namePreview.text('Prénom(s): '+preview.first+' | Nom: '+preview.last);
        $nameHelper.removeClass('d-none');
      }

      $fullName.on('input blur', refreshNameHelper);
      $lastCount.on('change', function(){
        const tokens = tokenizeName($fullName.val());
        const lc = parseInt($(this).val(), 10) || 1;
        const preview = buildNamePreview(tokens, lc);
        $namePreview.text('Prénom(s): '+preview.first+' | Nom: '+preview.last);
      });

      // -- Submit handler --
      let sortState = { key: null, dir: 1 }; // partagé pour re-rendu après ajout

      $form.on('submit', function(e){
        e.preventDefault();

        // Validation HTML5 de base
        let ok = true;
        $form.find('input').each(function(){
          const valid = this.checkValidity();
          $(this).toggleClass('is-invalid', !valid).toggleClass('is-valid', valid);
          if(!valid) ok = false;
        });

        // Date: pas de futur + âge mini
        const birthVal = $('#birth').val();
        const birthChk = validBirth(birthVal);
        $('#birth').toggleClass('is-invalid', !birthChk.ok).toggleClass('is-valid', birthChk.ok);
        if(!birthChk.ok){
          $('#birthFeedback').text(birthChk.msg);
          ok = false;
        }

        // Validation spécifique des notes
        const gradesStr = $('#grades').val().trim();
        const gradesValid = validateGradesString(gradesStr);
        $('#grades').toggleClass('is-invalid', !gradesValid).toggleClass('is-valid', gradesValid);
        if(!gradesValid) ok = false;

        if(!ok) return;

        // Séparation prénom/nom selon helper (si présent)
        const tokens = tokenizeName($fullName.val());
        let first, last;
        if(tokens.length > 2){
          const lc = parseInt($lastCount.val(), 10) || 1;
          const split = buildNamePreview(tokens, lc);
          first = split.first; last = split.last;
        } else {
          if(tokens.length === 1){ first = tokens[0]; last = ''; }
          else { first = tokens[0]; last = tokens[1]; }
        }

        const email = $('#email').val().trim();
        const emailMasked = anonymizeEmail(email);
        const numbers = parseGrades(gradesStr);
        const count = numbers.length;
        const min = count ? Math.min.apply(null, numbers) : null;
        const max = count ? Math.max.apply(null, numbers) : null;
        const avgNum = count ? mean(numbers) : NaN;
        const color = $('#rowColor').val();

        addRow({ first, last, emailMasked, birth: birthVal, count, min, max, avgNum, color });

        // Réappliquer le tri courant s'il existe
        if(sortState.key){ renderSorted(); }

        // Reset léger (on conserve la couleur choisie et l’état du helper sera recalculé à la prochaine saisie)
        this.reset();
        $form.find('.is-valid').removeClass('is-valid');
        $('#rowColor').val(color);
        $nameHelper.addClass('d-none');
      });

      // -- Export CSV (séparateur ';') --
      $('#exportCsv').on('click', function(){
        const headers = ['Prenom','Nom','Email (anonymise)','Date de naissance','#','Min','Max','Moyenne','Couleur'];
        const rows = [];
        $tableBody.find('tr').each(function(){
          const rec = $(this).data('record');
          if(!rec) return;
          const arr = [
            rec.first,
            rec.last,
            rec.emailMasked,
            rec.birth,
            String(rec.count),
            rec.min!=null ? rec.min.toString().replace('.', ',') : '',
            rec.max!=null ? rec.max.toString().replace('.', ',') : '',
            Number.isFinite(rec.avgNum) ? rec.avgNum.toFixed(2).replace('.', ',') : '',
            rec.color || ''
          ];
          rows.push(arr);
        });
        const sep = ';';
        function esc(v){
          const s = (v==null?'' : String(v));
          const t = s.replace(/"/g, '""');
          return /["\n\r;]/.test(t) ? '"'+t+'"' : t;
        }
        const csv = [headers.map(esc).join(sep)]
          .concat(rows.map(r => r.map(esc).join(sep)))
          .join('\n');
        const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eleves.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });

      // -- Tri des colonnes --
      function compareByKey(a,b,key){
        const va = a[key], vb = b[key];
        if(key === 'count' || key === 'min' || key === 'max' || key === 'avgNum'){
          const na = Number(va), nb = Number(vb);
          if(na < nb) return -1; if(na > nb) return 1; return 0;
        }
        if(key === 'birth'){
          if(va < vb) return -1; if(va > vb) return 1; return 0;
        }
        return String(va).localeCompare(String(vb), 'fr', {sensitivity:'base'});
      }

      function renderSorted(){
        const rows = $tableBody.find('tr').get().map(tr => ({ el: tr, rec: $(tr).data('record') }));
        if(!rows.length) return;
        const { key, dir } = sortState;
        if(!key) return;
        rows.sort((ra, rb) => dir * compareByKey(ra.rec, rb.rec, key));
        $tableBody.empty();
        rows.forEach(r => $tableBody.append(r.el));
      }

      function clearIndicators(){ $table.find('thead .sort-indicator').text(''); }

      
      $table.find('thead th.sortable').on('click', function(){
        const key = $(this).data('key');
        if(sortState.key === key){ sortState.dir *= -1; } else { sortState.key = key; sortState.dir = 1; }
        clearIndicators();
        const indicator = sortState.dir === 1 ? '▲' : '▼';
        $(this).find('.sort-indicator').text(indicator);
        renderSorted();
      });

      // -- Réinitialisation tableau --
      $('#clearTable').on('click', function(){
        $tableBody.empty();
      });

      // -- Réinitialisation formulaire (cosmétique)
      $('#resetForm').on('click', function(){
        $form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $nameHelper.addClass('d-none');
      });
    });