export interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_url?: string;
  categories?: string;
  nutriscore_grade?: string;
}

export interface OpenFoodFactsResponse {
  code?: string;
  status: number | string;   // v2 : 1 / 0 ; v3 : 'success' / 'failure'
  product?: OpenFoodFactsProduct;
}
