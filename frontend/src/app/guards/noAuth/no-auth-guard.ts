import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { AuthService } from '../../auth/services/authService/auth-service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1) Si venís de un logout, NO redirigimos, dejamos entrar a la ruta pública
  if (authService.estaEnLogout) {
    return true;
  }

  // 2) Lógica normal: si está logueado, no lo dejo ir a login/registro/bienvenida
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/home']);
  }

  // 3) Si no está logueado, puede acceder a login/registro/bienvenida
  return true;
  
};
