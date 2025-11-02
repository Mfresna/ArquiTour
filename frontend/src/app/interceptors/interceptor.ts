import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { TokenService } from "../services/tokenService/token-service";


@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(private tokenService: TokenService) {}

  //Este método se ejecuta AUTOMÁTICAMENTE en cada request HTTP
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.obtenerToken();

    let requestModificada = req;
    //Tengo un token: agrego auth y dejo que las cookies viajen
    if (token) {
      requestModificada = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    } else {
      // No se agrega al header pero igual se clona porque permite que la cookie de refresh que guarda el backend sí se envíe
      requestModificada = req.clone({ withCredentials: true });
    }

    return next.handle(requestModificada).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Token expirado o inválido');
        }
        return throwError(() => error);
      })
    );
  }
}
