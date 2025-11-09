/**
 * AppConfig
 * ----------
 * Centralise toutes les valeurs de configuration et les sélecteurs CSS.
 * Statique (pas d'instance), donc aucun état mutable à l'exécution.
 */
class AppConfig {
    // Règle métier : âge minimum autorisé
    static MIN_AGE = 16;

    // Tous les sélecteurs du DOM (utilisés par UIHandlers pour cache jQuery)
    static SELECTORS = {
        form: '#studentForm',                       // formulaire principal
        table: '#studentsTable',                    // table d'affichage
        tableBody: '#studentsTable tbody',          // body de la table (lignes injectées)
        fullName: '#fullName',                      // input Nom complet
        lastCount: '#lastCount',                    // select: nb de mots alloués au nom de famille
        nameHelper: '#nameSplitHelper',             // bloc helper "split nom"
        namePreview: '#namePreview',                // aperçu du split prénom/nom
        minAgeLabel: '#minAgeLabel, #minAgeLabel2', // affichage dynamique de MIN_AGE
        exportCsv: '#exportCsv',                    // bouton Export CSV
        clearTable: '#clearTable',                  // bouton Vider la table
        resetForm: '#resetForm'                     // bouton Reset "cosmétique"
    };
}
