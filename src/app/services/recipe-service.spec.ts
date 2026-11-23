import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RecipeService } from './recipe-service';
import { Meal } from '../models/mealdb';

describe('RecipeService', () => {
  let service: RecipeService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RecipeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('toRecipe transforme strIngredient1..20 en tableau et ignore les vides', () => {
    const meal: Meal = {
      idMeal: '52772', strMeal: 'Teriyaki Chicken', strMealThumb: 'img.jpg',
      strIngredient1: 'soy sauce', strMeasure1: '3/4 cup',
      strIngredient2: ' water ', strMeasure2: ' 1/2 cup ',
      strIngredient3: '', strMeasure3: '',
      strIngredient4: null, strMeasure4: null,
    };
    const recipe = service.toRecipe(meal);
    expect(recipe.id).toBe('52772');
    expect(recipe.ingredients).toEqual([
      { name: 'soy sauce', measure: '3/4 cup' },
      { name: 'water', measure: '1/2 cup' },
    ]);
  });

  it('searchRecipes renvoie [] quand TheMealDB répond meals: null', () => {
    let result: unknown;
    service.searchRecipes('zzz').subscribe(r => (result = r));
    const req = http.expectOne(r => r.url.endsWith('/search.php') && r.params.get('s') === 'zzz');
    expect(req.request.method).toBe('GET');
    req.flush({ meals: null });
    expect(result).toEqual([]);
  });
});
