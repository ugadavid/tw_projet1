/**
 * AppMain
 * -------
 * Point d’entrée unique : crée UIHandlers (UI) puis StudentManager (métier).
 * L'init statique garantit une instanciation après DOM Ready.
 */
class AppMain {
    constructor() {
        this.ui = new UIHandlers(this);
        this.manager = new StudentManager(this);
    }

    /** Appelé depuis index.html (après chargement de tous les scripts). */
    static init() {
        $(function() {
            new AppMain();
        });
    }
}
