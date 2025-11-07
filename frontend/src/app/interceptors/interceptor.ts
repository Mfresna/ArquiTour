import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { AuthService } from '../auth/services/authService/auth-service';
import { TokenService } from '../auth/services/tokenService/token-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Rutas públicas que no necesitan token
  const urlsPublicas = [
    '/auth/login',
    '/auth/register',
    '/auth/password',
    '/auth/refresh'
  ];

  if (urlsPublicas.some(url => req.url.includes(url))) {
    //Si es una URL publica solo le envio las Cookies
    return next(req.clone({ withCredentials: true }));
  }

  //Si Existe le agrega el token a la peticion
  const accessToken = tokenService.obtenerToken();

  //Le agrega el accesstoken si existe y las cookies
  const reqConToken = 
  
  accessToken 
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      })
    : req.clone({ withCredentials: true });

  // Manejar respuestas
  return next(reqConToken).pipe(
    //Si devuelve error 401 es falta de Token (Ejecuta el Refresh)
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && !req.url.includes('/refresh')) {
        //Solo a peticion que devuelven 401 y no sean de refresh (evita bucle infinito)
        console.warn('El accessToken expiró... Intentando hacer refresh del token');
        return handleRefreshToken(req, next, authService);
      }
      return throwError(() => e);
    })
  );

};

function handleRefreshToken(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService) {

  /*Se fija que no haya un refresh en proceso, evita que el usuario haga multiples peticiones simultaneas de refresh. 
  Para eso cuando se inicia un refresh se cambia un flag en AuthService y solo mando otra peticion al servicio cuando
  el flag es false, es decir no hay refresh activo */

  if (authService.isRefreshActivo()) {
    console.log("Hay un refresh en progreso...Aguarde para hacer otra peticion");
    return authService.getRefreshTokenSubject().pipe(
      filter(token => token !== null),
      take(1),
      switchMap(newToken => {
        console.log("Ya Pidieron el nuevo token, ahora probamos con ese");
        return next(requestConNuevoToken(req, newToken!));
      })
    );
  }

  // No hay refresh activo asique lo
  authService.setEstadoRefresh(true);
  authService.getRefreshTokenSubject().next(null);


  return authService.refreshToken().pipe(
    switchMap(response => {
      console.log("Reintentando petición original con Nuevo Token");
      return next(requestConNuevoToken(req, response.accessToken));
    }),
    catchError(error => {
      console.error("El Refresh Fallo, se cierra sesion y se debe loguear de vuelta");
      return throwError(() => error);
    })
  );
}

function requestConNuevoToken(req: HttpRequest<any>, nuevoToken: string): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${nuevoToken}` },
    withCredentials: true
  });
}
