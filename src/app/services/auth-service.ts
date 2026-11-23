import { Injectable, inject } from '@angular/core';
import {
  Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider
} from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  // S3 : émet l'utilisateur courant, ou null
  readonly user$ = authState(this.auth);

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  // Mini défi S3-1 : mot de passe oublié
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // Mini défi S3-2 : connexion avec Google
  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }
}

// S3 : gestion des erreurs du formulaire d'inscription / connexion
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code ?? '';
  switch (code) {
    case 'auth/email-already-in-use': return 'Cet email est déjà utilisé.';
    case 'auth/invalid-email': return 'Adresse email invalide.';
    case 'auth/weak-password': return 'Mot de passe trop faible (6 caractères minimum).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email ou mot de passe incorrect.';
    default: return 'Une erreur est survenue. Réessayez.';
  }
}
