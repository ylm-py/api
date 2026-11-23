import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, addDoc, updateDoc,
  deleteDoc, query, where, writeBatch
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { ShoppingItem } from '../models/shopping-item';
import { toDate } from '../utils/dates';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private readonly firestore = inject(Firestore);
  private readonly itemsRef = collection(this.firestore, 'shoppingList');

  getItems(userId: string): Observable<ShoppingItem[]> {
    const q = query(this.itemsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs.map(d => ({ ...d, createdAt: toDate(d['createdAt']) }) as ShoppingItem))
    );
  }

  addItem(userId: string, name: string) {
    return addDoc(this.itemsRef, {
      userId, name, checked: false, source: 'manual', createdAt: new Date()
    });
  }

  // plusieurs écritures en une seule opération
  addMany(userId: string, names: string[]) {
    const batch = writeBatch(this.firestore);
    for (const name of names) {
      batch.set(doc(this.itemsRef), {
        userId, name, checked: false, source: 'recipe', createdAt: new Date()
      });
    }
    return batch.commit();
  }

  toggle(item: ShoppingItem) {
    return updateDoc(doc(this.firestore, 'shoppingList', item.id!), { checked: !item.checked });
  }

  remove(id: string) {
    return deleteDoc(doc(this.firestore, 'shoppingList', id));
  }
}
