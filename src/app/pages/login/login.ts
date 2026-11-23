import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, authErrorMessage } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { email, password } = this.form.getRawValue();
    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this.error.set(authErrorMessage(e));
    }
  }

  async google() {
    try {
      await this.authService.loginWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this.error.set(authErrorMessage(e));
    }
  }

  async forgot() {
    const email = this.form.controls.email.value;
    if (!email) { this.error.set("Saisissez d'abord votre email."); return; }
    try {
      await this.authService.resetPassword(email);
      this.error.set(null);
      this.info.set('Email de réinitialisation envoyé.');
    } catch (e) {
      this.error.set(authErrorMessage(e));
    }
  }
}
