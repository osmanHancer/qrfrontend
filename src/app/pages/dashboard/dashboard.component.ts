import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PersonsService, PersonDto } from '../../services/persons.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Dashboard</h2>
      <p>Giriş başarılı! Korumalı sayfadasınız.</p>
      
      <div class="navigation">
        <button class="nav-btn" (click)="goToPersons()">Kişi Yönetimi</button>
        <button class="logout-btn" (click)="logout()">Çıkış Yap</button>
      </div>

      <div class="list">
        <h3>Son Eklenen Kişiler</h3>
        <button (click)="load()">Yenile</button>
        @if (loading()) {
          <div>Yükleniyor...</div>
        }
        @if (error()) {
          <div class="error">{{ error() }}</div>
        }
        <ul>
          @for (p of persons(); track p.id) {
            <li>
              {{ p.id }} - {{ p.ad }} {{ p.soyad }} ({{ p.tcno }}) {{ p.dogumTarihi }} {{ p.olumTarihi }}
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 720px; margin: 24px auto; }
    .navigation { margin: 20px 0; display: flex; gap: 10px; }
    .nav-btn { padding: 10px 20px; border: none; background: #007bff; color: #fff; border-radius: 6px; cursor: pointer; }
    .logout-btn { padding: 8px 12px; border: none; background: #ef5350; color: #fff; border-radius: 6px; cursor: pointer; }
    .list { margin-top: 16px; }
    .error { color: #d32f2f; }
  `]
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly personsService = inject(PersonsService);

  persons = signal<PersonDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goToPersons(): void {
    this.router.navigateByUrl('/persons');
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.personsService.getAll().subscribe({
      next: (data) => {
        this.loading.set(false);
        this.persons.set(data || []);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Liste alınamadı');
      }
    });
  }
}


