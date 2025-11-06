// import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { catchError, throwError } from 'rxjs';
// import { TokenService } from '../auth/services/tokenService/token-service';

// export function jwtInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {

//   const tokenService = inject(TokenService);
//   const accesToken = tokenService.obtenerToken();

//   const reqModificada = accesToken
//     ? req.clone({
//         setHeaders: { Authorization: `Bearer ${accesToken}` },
//         withCredentials: true
//       })
//     : req.clone({withCredentials: true });

//   return next(reqModificada).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         console.warn('Token expirado o inválido');
//       }
//       return throwError(() => error);
//     })
//   );
  
// }

import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { AuthService } from '../auth/services/authService/auth-service';
import { TokenService } from '../auth/services/tokenService/token-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Rutas públicas que no necesitan token
  const skipUrls = ['/auth/login', '/auth/register', '/auth/password', '/auth/refresh'];
  const shouldSkip = skipUrls.some(url => req.url.includes(url));

  if (shouldSkip) {
    return next(req.clone({ withCredentials: true }));
  }

  // Agregar token a la petición
  const accessToken = tokenService.obtenerToken();
  const reqConToken = accessToken
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      })
    : req.clone({ withCredentials: true });

  // Manejar respuestas
  return next(reqConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh')) {
        console.warn('⚠️ Token expirado (401), intentando refresh...');
        return handleRefreshToken(req, next, authService, tokenService);
      }
      return throwError(() => error);
    })
  );
};

// ============================================
// FUNCIÓN AUXILIAR PARA EL REFRESH
// ============================================
function handleRefreshToken(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenService: TokenService
) {
  // Si ya hay un refresh en progreso, esperar
  if (authService.isRefreshTokenInProgress()) {
    console.log('⏳ Esperando refresh en progreso...');
    return authService.getRefreshTokenSubject().pipe(
      filter(token => token !== null),
      take(1),
      switchMap(newToken => {
        console.log('✅ Reintentando con nuevo token');
        return next(cloneRequestWithToken(req, newToken!));
      })
    );
  }

  // Iniciar refresh
  authService.setRefreshTokenInProgress(true);
  authService.getRefreshTokenSubject().next(null);

  return authService.refreshToken().pipe(
    switchMap(response => {
      console.log('✅ Reintentando petición original');
      return next(cloneRequestWithToken(req, response.accessToken));
    }),
    catchError(error => {
      console.error('❌ Refresh falló, cerrando sesión');
      return throwError(() => error);
    })
  );
}

function cloneRequestWithToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
}
