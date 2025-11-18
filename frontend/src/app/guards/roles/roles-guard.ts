import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { tap, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../../auth/services/authService/auth-service';

export const rolesGuard: CanActivateFn = (route, state) => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  let token = tokenService.get();


  // 1) HAY ACCESS TOKEN: se validan roles directamente

  if (token) {
    return validarRoles(tokenService, router, route);
  }


  // 2) NO HAY TOKEN: intentar REFRESH


  return authService.refreshToken().pipe(

    tap(resp => {
      tokenService.set(resp.accessToken);
    }),

    switchMap(() => {
    return of(validarRoles(tokenService, router, route));
    }),

    catchError(err => {
      return of(router.createUrlTree(['/'], {
        queryParams: { redirectTo: state.url }
      }));
    })
  );
};


function validarRoles(tokenService: TokenService, router: Router, route: any) {

  const rolesRequeridos: string[] = route.data['roles'] || [];

  if (!rolesRequeridos.length) return true;

  const rolesUsuario = tokenService.obtenerRoles();

  const tieneRol = rolesRequeridos.some(rol =>
    tokenService.tieneRol(rol)
  );


  if (tieneRol) {
    return true;
  }

  return router.createUrlTree(['/obras']);
}