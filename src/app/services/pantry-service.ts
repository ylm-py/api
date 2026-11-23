import { Injectable, inject } from '@angular/core';
import {
  Firestore, DocumentData, collection, collectionData, doc,
  addDoc, updateDoc, deleteDoc, query, where
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { PantryProduct } from '../models/pantry-product';
import { toDate } from '../utils/dates';

// Firestore refuse les champs undefined ("Unsupported field value: undefined")
function clean(data: object): DocumentData {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}

@Injectable({ providedIn: 'root' })
export class PantryService {
  private readonly firestore = inject(Firestore);
  private readonly productsRef = collection(this.firestore, 'products');

  // R : flux temps réel des produits de l'utilisateur
  getProducts(userId: string): Observable<PantryProduct[]> {
    const q = query(this.productsRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs.map(d => ({
        ...d,
        purchaseDate: toDate(d['purchaseDate']),
        expirationDate: toDate(d['expirationDate']),
      }) as PantryProduct))
    );
  }

  // C
  addProduct(product: PantryProduct) {
    const { id, ...data } = product;
    return addDoc(this.productsRef, clean(data));
  }

  // U
  updateProduct(id: string, changes: Partial<PantryProduct>) {
    const { id: _ignored, userId: _owner, ...data } = changes;
    return updateDoc(doc(this.firestore, 'products', id), clean(data));
  }

  // D
  deleteProduct(id: string) {
    return deleteDoc(doc(this.firestore, 'products', id));
  }
}
