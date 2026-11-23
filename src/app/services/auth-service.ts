import { Injectable, inject } from '@angular/core';
import {
  Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider
} from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  // émet l'utilisateur courant, ou null
  readonly user$ = authState(this.auth);

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    return signOut(this.auth);
  }

  async getUid(): Promise<string> {
    const user = await firstValueFrom(this.user$);
    if (!user) throw new Error('Utilisateur non connecté');
    return user.uid;
  }
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code ?? '';
  switch (code) {
    case 'auth/email-already-in-use': return 'Cet email est déjà utilisé.';
    case 'auth/invalid-email': return 'Adresse email invalide.';
    case 'auth/weak-password': return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email ou mot de passe incorrect.';
    case 'auth/too-many-requests': return 'Trop de tentatives. Réessayez plus tard.';
    case 'auth/operation-not-allowed': return 'Méthode de connexion non activée dans la console Firebase.';
    default: return 'Une erreur est survenue. Réessayez.';
  }
}
