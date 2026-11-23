import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, collectionData, doc,
  addDoc, updateDoc, deleteDoc, query, where
} from '@angular/fire/firestore';
import { Observable, firstValueFrom, map } from 'rxjs';
import { AuthService } from './auth-service';
import { PantryProduct } from '../models/pantry-product';
import { toDate } from '../utils/dates';

// S2 : gérer les produits du stock MyPantry dans Firestore
@Injectable({ providedIn: 'root' })
export class PantryService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  // C — S3 : chaque produit appartient à un utilisateur (userId = uid)
  async addProduct(product: Omit<PantryProduct, 'userId'>) {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) throw new Error('Utilisateur non connecté');
    return addDoc(collection(this.firestore, 'products'), {
      ...product,
      userId: user.uid
    });
  }

  // R — S3 : filtre sur userId (la vraie sécurité reste dans les Security Rules)
  getProducts(userId: string): Observable<PantryProduct[]> {
    const q = query(collection(this.firestore, 'products'), where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }).pipe(
      // Firestore renvoie des Timestamp : on les reconvertit en Date
      map(docs => docs.map(d => ({
        ...d,
        purchaseDate: toDate(d['purchaseDate']),
        expirationDate: toDate(d['expirationDate']),
      }) as PantryProduct))
    );
  }

  // U
  updateProduct(id: string, changes: Partial<PantryProduct>) {
    const productRef = doc(this.firestore, 'products', id);
    return updateDoc(productRef, changes);
  }

  // D
  deleteProduct(id: string) {
    const productRef = doc(this.firestore, 'products', id);
    return deleteDoc(productRef);
  }
}
