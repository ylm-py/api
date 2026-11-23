export interface ShoppingItem {
  id?: string;
  userId: string;
  name: string;
  checked: boolean;
  source: 'manual' | 'recipe';
  createdAt: Date;
}
