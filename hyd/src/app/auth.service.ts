import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserPOST } from './types';
import { jwtDecode } from 'jwt-decode';
import { catchError, tap, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // API URLs from environment configuration
  private readonly apiBase = environment.apiUrl;
  private readonly registerUrl = `${this.apiBase}/register`;
  private readonly loginUrl = `${this.apiBase}/login`;
  private readonly verifyEmailUrl = `${this.apiBase}/verify-email`;
  private readonly resendVerificationUrl = `${this.apiBase}/resend-verification-email`;

  readonly isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  registerUser(user: UserPOST) {
    return this.http.post<any>(this.registerUrl, user).pipe(
      catchError((error) => {
        const message =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.message ||
          error?.message ||
          'Registration failed';

        return throwError(() => new Error(message));
      })
    );
  }

  loginUser(user: UserPOST) {
    return this.http.post<any>(this.loginUrl, user).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        this.isLoggedIn.set(true);
      }),
      catchError((error) => {
        this.isLoggedIn.set(false);
        const message =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.message ||
          error?.message ||
          'Login failed';

        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/auth/login']);
  }

  verifyEmail(token: string, userId: string) {
    return this.http.post<any>(this.verifyEmailUrl, { token, userId }).pipe(
      catchError((error) => {
        const message =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.message ||
          error?.message ||
          'Email verification failed';

        return throwError(() => new Error(message));
      })
    );
  }

  resendVerificationEmail(email: string) {
    return this.http.post<any>(this.resendVerificationUrl, { email }).pipe(
      catchError((error) => {
        const message =
          (typeof error?.error === 'string' && error.error) ||
          error?.error?.message ||
          error?.message ||
          'Failed to resend verification email';

        return throwError(() => new Error(message));
      })
    );
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode<User>(token).role === 'admin';
      } catch (error) {
        console.error('Invalid token', error);
        return false;
      }
    }
    return false;
  }
}
