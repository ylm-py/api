import { Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, authErrorMessage } from '../../services/auth-service';

// S3 : la confirmation doit être identique au mot de passe
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirm: ['', Validators.required],
  }, { validators: passwordsMatch });

  // S3 : createUserWithEmailAndPassword
  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    try {
      await this.authService.register(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (e) {
      this.error.set(authErrorMessage(e));
    }
  }
}
