import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { AuthService } from '../../auth/services/authService/auth-service';
import { catchError, map, of, tap } from 'rxjs';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const tokenService = inject(TokenService);

  // 1) Si venís de un logout, NO redirigimos, dejamos entrar a la ruta pública
  if (authService.estaEnLogout) {
    return true;
  }

  // 2) Lógica normal: si está logueado, no lo dejo ir a login/registro/bienvenida
  // if (authService.isAuthenticated()) {
  //   return router.createUrlTree(['/home']);
  // }

  // if (authService.isAuthenticated() || sessionStorage.getItem('logueado') === 'true') {
  //   return router.createUrlTree(['/obras']);  // <---- CAMBIO AQUÍ
  // }

  // // 3) Si no está logueado, puede acceder a login/registro/bienvenida
  // return true;
  
  const token = tokenService.get();

  if (token) {
    return router.createUrlTree(['/obras']);
  }

  return authService.refreshToken().pipe(

    tap(resp => {
      tokenService.set(resp.accessToken);
    }),

    map((): boolean | UrlTree => router.createUrlTree(['/obras'])),

    catchError(() => {
      return of(true);
    })
  );

}
