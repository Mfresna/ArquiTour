import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../auth/services/tokenService/token-service';

export const noAuthGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.get();

  // Si ya está logueado lo redirigimos obras
  if (token) {
    return router.createUrlTree(['/obras']);
  }

  // Si no está logueado 
  return true;
  
};
