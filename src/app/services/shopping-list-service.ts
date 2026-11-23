import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth-service';

// Mini défi S5-3 : ajouter les ingrédients manquants à la liste de courses
// (collection Firestore dédiée : shoppingList)
@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  async addItems(names: string[]) {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) throw new Error('Utilisateur non connecté');
    const itemsRef = collection(this.firestore, 'shoppingList');
    return Promise.all(names.map(name => addDoc(itemsRef, { name, userId: user.uid })));
  }
}
