import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { AuthService } from '../../auth/services/authService/auth-service';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map, of, tap } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenService.get();


  // 1) YA HAY ACCESS TOKEN EN MEMORIA: PASA
 
  if (token) {
   
    return true;
  }

  // 2) NO HAY TOKEN: INTENTAMOS REFRESH

  return authService.refreshToken().pipe(

    tap(resp => {
      // Guardar el nuevo accessToken en memoria
      tokenService.set(resp.accessToken);
    }),

    map(() => {
      return true;
    }),

    catchError(err => {
      return of(router.createUrlTree(['/']));
    })
  );

  
};
