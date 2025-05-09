import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserPOST } from './types';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  #registerUrl = 'http://localhost:3000/api/register';
  #loginUrl = 'http://localhost:3000/api/login';
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  getToken() {
    return localStorage.getItem('token');
  }
  registerUser(user: UserPOST) {
    return this.http.post<any>(this.#registerUrl, user);
  }

  loginUser(user: UserPOST) {
    return this.http.post<any>(this.#loginUrl, user);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
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
