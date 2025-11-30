import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h2>Giriş Yap</h2>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          E-posta
          <input type="email" formControlName="email" placeholder="ornek@mail.com" />
        </label>
        <div class="error" *ngIf="form.controls.email.touched && form.controls.email.invalid">
          Geçerli bir e-posta giriniz.
        </div>

        <label>
          Şifre
          <input type="password" formControlName="password" placeholder="••••" />
        </label>
        <div class="error" *ngIf="form.controls.password.touched && form.controls.password.invalid">
          Şifre en az 4 karakter olmalı.
        </div>

        <button type="submit" [disabled]="loading()">Giriş</button>
      </form>

      <div class="alert" *ngIf="error()">{{ error() }}</div>
    </div>
  `,
  styles: [`
    .login-container { max-width: 360px; margin: 40px auto; padding: 24px; border: 1px solid #eee; border-radius: 8px; }
    form { display: flex; flex-direction: column; gap: 12px; }
    label { display: flex; flex-direction: column; gap: 6px; }
    input { padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; }
    button { padding: 10px 12px; border-radius: 6px; border: none; background: #1976d2; color: white; cursor: pointer; }
    .error { color: #d32f2f; font-size: 12px; }
    .alert { margin-top: 10px; color: #d32f2f; }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Giriş başarısız';
        this.error.set(msg);
      }
    });
  }
}


