// S4 : unités de MyPantry (kg, g, L, mL, piece) ; S1 : « pot » dans la maquette
export const UNITS = ['piece', 'g', 'kg', 'mL', 'L', 'pot'] as const;
export const LOCATIONS = ['placard', 'frigo', 'congélateur'] as const;

// S2 : modèle métier ; S3 : + userId
export interface PantryProduct {
  id?: string;
  userId: string;
  name: string;
  brand?: string;
  image?: string;
  category?: string;
  quantity: number;
  unit: string;
  purchaseDate?: Date;
  expirationDate?: Date;
  location: string;
  minQuantity: number;
}
