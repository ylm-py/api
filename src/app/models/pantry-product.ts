export const UNITS = ['piece', 'g', 'kg', 'mL', 'L', 'pot', 'paquet'] as const;
export const LOCATIONS = ['placard', 'frigo', 'congélateur', 'cave'] as const;

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
