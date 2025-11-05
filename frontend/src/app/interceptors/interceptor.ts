import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../auth/services/tokenService/token-service';


export function jwtInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {
  const tokenService = inject(TokenService);
  const accesToken = tokenService.obtenerToken();

  const reqModificada = accesToken
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${accesToken}` },
        withCredentials: true
      })
    : req.clone({ withCredentials: true });

  return next(reqModificada).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Token expirado o inválido');
      }
      return throwError(() => error);
    })
  );
}
