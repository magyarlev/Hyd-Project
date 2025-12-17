import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
  }

  return next(req);
};
