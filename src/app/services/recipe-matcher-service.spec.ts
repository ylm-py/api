import { RecipeMatcherService, normalize } from './recipe-matcher-service';
import { PantryProduct } from '../models/pantry-product';
import { Recipe } from '../models/recipe';

function product(name: string, quantity = 1): PantryProduct {
  return { userId: 'u1', name, quantity, unit: 'piece', location: 'placard', minQuantity: 1 };
}

const recipe: Recipe = {
  id: '1',
  name: 'Omelette',
  image: '',
  ingredients: [
    { name: 'Eggs', measure: '3' },
    { name: 'Milk', measure: '50 ml' },
    { name: 'Salt', measure: 'pinch' },
    { name: 'Butter', measure: '10 g' },
  ],
};

describe('RecipeMatcherService', () => {
  const matcher = new RecipeMatcherService();

  it('normalize ignore la casse et les espaces', () => {
    expect(normalize('  Eggs ')).toBe('eggs');
  });

  it('calcule la disponibilité en pourcentage', () => {
    const result = matcher.match(recipe, [product('eggs'), product('MILK')]);
    expect(result.availableIngredients.map(i => i.name)).toEqual(['Eggs', 'Milk']);
    expect(result.missingIngredients.map(i => i.name)).toEqual(['Salt', 'Butter']);
    expect(result.availability).toBe(50);
  });

  it('ne compte pas un produit à quantité 0', () => {
    const result = matcher.match(recipe, [product('Eggs', 0)]);
    expect(result.availability).toBe(0);
  });

  it('renvoie 0 pour une recette sans ingrédient', () => {
    expect(matcher.match({ ...recipe, ingredients: [] }, []).availability).toBe(0);
  });

  it('matchAll trie les recettes les plus compatibles en premier', () => {
    const other: Recipe = { ...recipe, id: '2', ingredients: [{ name: 'Eggs', measure: '' }] };
    const result = matcher.matchAll([recipe, other], [product('Eggs')]);
    expect(result.map(m => m.recipe.id)).toEqual(['2', '1']);
  });
});
