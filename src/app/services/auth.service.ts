import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string; // NestJS genelde 'access_token' döner
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenKey = 'qr_token';
  readonly isAuthenticated = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      this.isAuthenticated.set(true);
    }
  }

  clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      this.isAuthenticated.set(false);
    }
  }

  login(payload: LoginRequest): Observable<boolean> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((res) => {
        const token = (res as any).access_token || (res as any).token;
        if (token) {
          this.setToken(token);
        }
      }),
      map((res) => !!((res as any).access_token || (res as any).token))
    );
  }

  verifyToken(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }
    return this.http.get<{ valid: boolean }>(`${this.apiUrl}/auth/verify-token`).pipe(
      map((res) => !!res?.valid),
      tap((ok) => this.isAuthenticated.set(ok))
    );
  }

  logout(): void {
    this.clearToken();
  }
}


