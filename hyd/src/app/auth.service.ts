import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  #registerUrl = 'http://localhost:3000/api/register';
  #loginUrl = 'http://localhost:3000/api/login';

  registerUser(user: User) {
    return this.http.post<any>(this.#registerUrl, user);
  }

  loginUser(user: User) {
    return this.http.post<any>(this.#loginUrl, user);
  }
}
