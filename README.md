# MyPantry

Projet fil rouge du cours **API et services cloud** (EILCO ING3), séances 1 à 5.
Le code suit les étapes du PDF du cours. Les fonctionnalités en plus sont uniquement des **mini défis** du PDF,
et chacune est marquée dans le code par un commentaire `Mini défi Sx-n` (séance x, défi n).

## Étapes du TP

| Séance | Contenu | Route |
|---|---|---|
| S1 | Angular 20 + Angular Material, `OpenFoodFactsService.getProduct()`, fiche produit + champs MyPantry | `/add` |
| S2 | Firebase + Firestore, `PantryService` (CRUD), « Ajouter au stock », page Mon stock | `/stock` |
| S3 | Inscription (avec confirmation), connexion, déconnexion, `userId`, Security Rules, route guard | `/register`, `/login` |
| S4 | `DashboardService`, compteurs + listes, quantité totale par unité, états chargement / vide / erreur | `/dashboard` |
| S5 | `RecipeService` (TheMealDB), modèle `Recipe`, `RecipeMatcherService`, disponibles / manquants / % | `/recipes` |

## Mini défis réalisés (tous)

| Défi | Où |
|---|---|
| S1-1 Nutri-Score | `add-product.html` |
| S1-2 Produit trouvé / inconnu | `OpenFoodFactsService.findProduct()`, `add-product` |
| S1-3 Indicateur de chargement | `add-product` |
| S1-4 Bouton désactivé pendant la recherche | `add-product.html` |
| S1-5 Touche Entrée | `add-product.html` |
| S1-6 `fields` | `OpenFoodFactsService` |
| S2-1 Formulaire de modification | `stock` |
| S2-2 Validation des champs | `add-product` |
| S2-3 Gestion des erreurs Firestore | `stock`, `add-product` |
| S2-4 Indicateur de chargement | `stock.html` |
| S2-5 Confirmation avant suppression | `stock` |
| S2-6 Filtre par catégorie | `stock` |
| S2-7 Filtre par emplacement | `stock` |
| S2-8 Tri par date d'expiration | `stock.ts` |
| S2-9 Image Open Food Facts | `stock.html` |
| S3-1 Mot de passe oublié | `AuthService`, `login` |
| S3-2 Connexion avec Google | `AuthService`, `login` |
| S4-1 Tri par date d'expiration | `DashboardService.getExpiringProducts()` |
| S4-2 Compteur de poids total | `DashboardService.getTotalWeight()`, `dashboard.html` |
| S4-3 Indicateur de stock vide (rupture) | `DashboardService.getEmptyProducts()`, `dashboard.html` |
| S4-4 Message personnalisé si stock vide | `dashboard.html` |
| S4-5 Graphique (produits par emplacement) | `DashboardService.getCountByLocation()`, `dashboard` |
| S4-6 Clic sur un indicateur -> page Stock | `dashboard.html` |
| S5-1 Recettes les plus compatibles d'abord | `RecipeMatcherService.matchAll()` |
| S5-2 Prioriser les recettes avec des produits bientôt périmés | `RecipeMatcherService` |
| S5-3 Ingrédients manquants -> liste de courses (collection `shoppingList`) | `ShoppingListService`, `recipes` |
| S5-4 Détail complet d'une recette | `recipes.html` |
| S5-5 Recherche par nom | `recipes` |

## Lancer le projet

1. `npm install`
2. Mettre la configuration Firebase dans `src/environments/environment.ts`.
3. Console Firebase :
   - **Authentication > Sign-in method** : activer **Adresse e-mail/Mot de passe** (et **Google** pour le mini défi S3-2).
   - **Firestore Database** : créer la base.
   - **Firestore > Règles** : coller le contenu de `firestore.rules`, puis publier.
4. `ng serve`, puis ouvrir http://localhost:4200.

## Déployer (S2, étape 3.2)

```bash
ng build
firebase deploy
```
