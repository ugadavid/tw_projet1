# README.md

## Student Roster – Base de référence JS (jQuery + ES6 Classes)

Ce mini-projet sert de gabarit propre et modulaire pour des interfaces “formulaire → tableau” avec :
- validation HTML5 + règles métiers,
- tri de colonnes,
- export CSV,
- séparation stricte des responsabilités en classes ES6.


### 🌳 Architecture
```bash
App/
├─ AppConfig.js         # Constantes et sélecteurs centralisés (stateless)
├─ Utils.js             # Fonctions pures et statiques (stateless)
├─ UIHandlers.js        # Gestion du DOM et des événements UI (DOMContentLoaded)
├─ StudentManager.js    # Logique métier (formulaire, tableau, tri, export)
└─ AppMain.js           # Point d’entrée : orchestre l’initialisation
index.html              # Démo / intégration
```

### Dépendances :

1. jQuery (3.7+)
2. (Optionnel) Bootstrap pour le style

### Ordre de chargement (script tags) :
1. jQuery
2. Bootstrap (optionnel)
3. AppConfig.js
4. Utils.js
5. UIHandlers.js
6. StudentManager.js
7. AppMain.js
8. AppMain.init() dans un <script> final

## 🔧 Principes d’architecture

- AppConfig centralise les constantes (ex. MIN_AGE) et les sélecteurs CSS.
- Utils regroupe les fonctions pures (tokenization, parsing/validation de notes, anonymisation email, formatage).
- UIHandlers
  - met en cache les éléments du DOM dans this.uiElements après $(document).ready(),
  - branche les events UI (helper de nom, reset, export/clear délégués au manager),
  - ne contient aucune règle métier.
- StudentManager
  - attend $(document).ready() pour récupérer app.ui.uiElements,
  - branche le submit du formulaire, fait la validation spécifique, calcule les stats et ajoute la ligne,
  - gère tri/export/suppression.
- AppMain
  - point d’entrée minimal qui instancie UIHandlers puis StudentManager,
  - AppMain.init() s’assure de l’exécution après que le DOM est prêt.

## 🧪 Cycle de vie / Initialisation

1. AppMain.init() (DOM Ready) → new AppMain()
2. new UIHandlers(app) →
  - au DOM Ready, remplit uiElements (cache jQuery)
  - branche les events UI
3. new StudentManager(app) →
  - au DOM Ready, récupère app.ui.uiElements
  - branche submit/tri et expose export/clear

## 🧰 Extensions fréquentes

- Animation à l’ajout : dans StudentManager.addRow, appliquer un tr.hide().appendTo(...).fadeIn(150).
- Colonnes dynamiques : factoriser addRow() pour générer les cellules à partir d’un schéma (array d’objets {key, align, render}).
- Stockage local : persister record dans localStorage/IndexedDB côté StudentManager (save/load).
- Accessibilité :
  - ajouter scope="col" aux th,
  - aria-live pour les messages d’erreur,
  - boutons avec aria-label.
- Tests unitaires : viser Utils (fonctions pures) en priorité.

## 🚀 Démarrage

1. Ouvre index.html avec les bons <script> dans l’ordre (voir plus haut).
2. Saisis un nom complet, email, date de naissance ≥ MIN_AGE, notes 0..20 séparées par ;.
3. Clique Ajouter (submit) → la ligne apparaît, tri possible, export CSV, suppression par ligne.

## 📦 Export CSV

- séparateur ;
- guillemets échappés "
- décimales en virgule , (convention FR)

## 🛡️ Règles métiers incluses

- Âge minimum (AppConfig.MIN_AGE)
- Date non future
- Notes : 0..20 avec , décimal, séparées par ;
- Email anonymisé : d****@domaine.tld

## 🗺️ Roadmap (idées)
- Filtres (par moyenne min/max)
- Édition en ligne des lignes
- Pagination côté client
- Export XLSX (SheetJS)
- Thèmes (clair/sombre)

