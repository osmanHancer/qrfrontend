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
    <div class="dashboard-container">
      <div class="header">
        <h1>Dashboard</h1>
        <button class="logout-btn" (click)="logout()">
          <i class="icon">🚪</i> Çıkış Yap
        </button>
      </div>

      <div class="welcome-section">
        <p class="welcome-text">Hoş geldiniz! Yönetim paneline hoş geldiniz.</p>
      </div>

      <div class="action-cards">
        <div class="action-card" (click)="goToPersons()">
          <div class="card-icon">👤</div>
          <h3>Kişi Ekle</h3>
          <p>Yeni kişi ekleyin ve QR kod oluşturun</p>
          <button class="card-btn">Kişi Yönetimi</button>
        </div>

        <div class="action-card" (click)="goToCompanies()">
          <div class="card-icon">🏢</div>
          <h3>Şirket Ekle</h3>
          <p>Yeni şirket ekleyin ve QR kod oluşturun</p>
          <button class="card-btn">Şirket Yönetimi</button>
        </div>
      </div>

      <div class="quick-links">
        <h3>Hızlı Erişim</h3>
        <div class="links">
          <button class="link-btn" (click)="goToPersons()">
            <i class="icon">📋</i> Kişi Yönetimi
          </button>
          <button class="link-btn" (click)="goToCompanies()">
            <i class="icon">🏢</i> Şirket Yönetimi
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h1 {
      margin: 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .logout-btn {
      padding: 10px 20px;
      border: none;
      background: #dc3545;
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s ease;
    }

    .logout-btn:hover {
      background: #c82333;
    }

    .welcome-section {
      margin-bottom: 40px;
      text-align: center;
    }

    .welcome-text {
      font-size: 1.2rem;
      color: #666;
      margin: 0;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .action-card {
      background: white;
      border-radius: 16px;
      padding: 40px 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      text-align: center;
    }

    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .action-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 500;
    }

    .action-card p {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 1rem;
    }

    .card-btn {
      padding: 12px 30px;
      border: none;
      background: #007bff;
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      transition: background 0.2s ease;
    }

    .card-btn:hover {
      background: #0056b3;
    }

    .quick-links {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: 1px solid #e0e0e0;
    }

    .quick-links h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 500;
    }

    .links {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .link-btn {
      padding: 12px 24px;
      border: 2px solid #007bff;
      background: white;
      color: #007bff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .link-btn:hover {
      background: #007bff;
      color: white;
    }

    .icon {
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 20px 15px;
      }

      .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .header h1 {
        font-size: 2rem;
      }

      .action-cards {
        grid-template-columns: 1fr;
      }

      .links {
        flex-direction: column;
      }

      .link-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goToPersons(): void {
    this.router.navigateByUrl('/persons');
  }

  goToCompanies(): void {
    this.router.navigateByUrl('/companies');
  }
}


