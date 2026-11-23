# MyPantry

Application de gestion de garde-manger : projet fil rouge du cours **API et services cloud** (EILCO ING3).
Projet de référence pour réviser l'examen pratique.

- **Angular 20** : composants standalone, `inject()`, signaux, `@if` / `@for`, formulaires réactifs
- **Open Food Facts** (HttpClient) : recherche d'un produit par code-barres
- **Firebase** (AngularFire 20) : Authentication (email/mot de passe et Google), Firestore, Security Rules, Hosting
- **TheMealDB** (HttpClient) : recettes, comparaison avec le stock
- **RxJS** : `map`, `switchMap`, `combineLatest`, `catchError`, `finalize`, `shareReplay`

## Fonctionnalités

| Page | Route | Séance |
|---|---|---|
| Inscription / Connexion (Google, mot de passe oublié) | `/register`, `/login` | S3 |
| Tableau de bord : nombre de produits, bientôt périmés (J+3), périmés, stock bas, totaux par unité | `/dashboard` | S4 |
| Stock : liste en temps réel, filtre par emplacement, tri par péremption, +/−, suppression | `/stock` | S2 |
| Ajouter un produit : recherche Open Food Facts puis formulaire | `/add` | S1 + S2 |
| Recettes : recherche TheMealDB, % d'ingrédients disponibles, ajout des manquants à la liste | `/recipes` | S5 |
| Liste de courses : produits sous le seuil + articles manuels ou issus de recettes | `/shopping-list` | S5 |

Toutes les pages sauf `/login` et `/register` sont protégées par `authGuard`.

## Lancer le projet

### 1. Installer

```bash
npm install
```

### 2. Créer le projet Firebase

1. Sur la [console Firebase](https://console.firebase.google.com), crée un projet.
2. Ajoute une application **Web** (`</>`) et copie l'objet `firebaseConfig`.
3. Colle ses valeurs dans `src/environments/environment.ts`.
4. **Authentication > Sign-in method** : active **Email/Password** (et **Google** si tu veux le bouton Google).
5. **Firestore Database** : crée la base.
6. **Firestore > Règles** : colle le contenu de `firestore.rules`, puis publie.

Sans l'étape 3, l'application démarre mais la connexion et Firestore échouent.

### 3. Démarrer

```bash
npm start
```

Ouvre http://localhost:4200. Tu arrives sur `/login` : crée un compte, puis ajoute un produit (par exemple le code-barres `3017624010701`).

### 4. Tests unitaires

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Les tests couvrent la logique métier : règles du tableau de bord, matching recette/stock et conversion TheMealDB.

### 5. Déployer sur Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # choisir ton projet (remplace .firebaserc)
ng build
firebase deploy             # hosting + firestore.rules
```

`firebase.json` est déjà configuré : dossier public `dist/my-pantry-app/browser` et réécriture SPA vers `index.html`.
Ajoute ensuite le domaine `<projet>.web.app` dans **Authentication > Settings > Authorized domains** si besoin.

## Structure

```
src/
├── environments/environment.ts      configuration Firebase
└── app/
    ├── app.config.ts                providers : router, HttpClient, Firebase, Firestore, Auth
    ├── app.routes.ts                routes + guards
    ├── app.ts / app.html            en-tête, navigation, <router-outlet>
    ├── guards/auth-guard.ts         authGuard, guestGuard
    ├── models/                      interfaces TypeScript (OFF, PantryProduct, MealDB, Recipe, ShoppingItem)
    ├── utils/dates.ts               Timestamp -> Date, dates locales
    ├── services/
    │   ├── open-food-facts-service.ts
    │   ├── pantry-service.ts        CRUD Firestore sur `products`
    │   ├── auth-service.ts
    │   ├── dashboard-service.ts     règles métier + combineLatest
    │   ├── recipe-service.ts        TheMealDB -> Recipe
    │   ├── recipe-matcher-service.ts
    │   └── shopping-list-service.ts CRUD + writeBatch sur `shoppingList`
    └── pages/                       add-product, stock, login, register, dashboard, recipes, shopping-list
firestore.rules                      chaque utilisateur ne lit et n'écrit que ses documents
firebase.json / .firebaserc          configuration Firebase CLI
```

## Modèle Firestore

```
products/{id}       userId, name, brand, image, category, quantity, unit,
                    purchaseDate, expirationDate, location, minQuantity
shoppingList/{id}   userId, name, checked, source ('manual' | 'recipe'), createdAt
```

Chaque document porte le `uid` de son propriétaire dans `userId`. Les requêtes filtrent avec `where('userId', '==', uid)`, car les Security Rules ne sont pas des filtres.
