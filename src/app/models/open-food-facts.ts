// S1 : réponse JSON d'Open Food Facts typée en TypeScript
export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  categories?: string;
  nutriscore_grade?: string;   // Mini défi S1-1 : Nutri-Score
}

export interface OpenFoodFactsResponse {
  status: number | string;     // l'API v3 renvoie 'success' / 'failure'
  product?: OpenFoodFactsProduct;
}
