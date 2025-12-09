import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../tokenService/token-service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthResponse } from '../../models/login/authResponseModel';
import { AuthRequest } from '../../models/login/authRequestModel';
import { BehaviorSubject, catchError, finalize, Subject, tap, throwError } from 'rxjs';
import { LoginForm } from '../../models/login/loginFormModel';
import { Router } from '@angular/router';
import { SolicitudDetalle } from '../../../pages/solicitudes/solicitud-detalle/solicitud-detalle';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly AUTH_URL = `${environment.apiUrl}/auth`;

  //Evento de logueo
  private authChangeSubject = new Subject<void>();
  authChange$ = this.authChangeSubject.asObservable();

  //Maneja la existencia de un refresh activo
  private estadoRefresh = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  private logoutEnProgreso = false;
  get estaEnLogout(): boolean {
    return this.logoutEnProgreso;
  }
 
  constructor(
    private http: HttpClient, 
    private tokenService: TokenService,
    private router: Router) {

      //Escucha si otra pestaña hace logout
      window.addEventListener('storage', (event) => {
        if (event.key === 'logout') {
          this.logout(true);
        }
      });
    }

  login(formulario: LoginForm){

    //Mapeo de atributos
    let credenciales: AuthRequest = {
      username: formulario.email,
      password: formulario.password
    };

    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, credenciales, {
      withCredentials: true,
    }).pipe(
      tap(res => {
        this.tokenService.set(res.accessToken);
        this.refreshTokenSubject.next(res.accessToken);

        sessionStorage.setItem('logueado', 'true');

        this.authChangeSubject.next();
      })
    );
  }

  refreshToken(){
    console.log('Se Solicito un Refresh...');
      
    return this.http.post<AuthResponse>(
      `${this.AUTH_URL}/refresh`,{},
      { withCredentials: true }  // Envía la cookie que contiene el RefreshToken
    ).pipe(
      tap(res => {
        console.log('Se recibe un nuevo AccessToken');
        this.tokenService.set(res.accessToken);

        //.next sirve para anunciar a las peticiones que hay un nuevo token, ese nuevo token es el 'res.accessToken'
        this.refreshTokenSubject.next(res.accessToken);
        this.estadoRefresh = false;
      }),
      catchError(error => {
        console.error("No se pudo Refrescar, se cierra sesion.");
        this.estadoRefresh = false;
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // logout() {
  //   //this.router.navigate(['/home']);

  //   this.tokenService.clear();
  //   this.estadoRefresh = false;
  //   this.refreshTokenSubject.next(null);

  //   sessionStorage.removeItem('logueado');

  //   // Llamar al backend para invalidar el refreshToken
  //   this.http.post(`${this.AUTH_URL}/logout`, {}, { withCredentials: true })
  //     .subscribe({
  //       next: () => console.log('Sesión cerrada en el servidor'),
  //       error: (err) => console.log('Error al cerrar sesión:', err)
  //     });
  // } 


  logout(disparadoPorOtraPestania: boolean = false) {
    this.logoutEnProgreso = true;
    // Primero intentamos navegar a algún lado (por ej. a '/obras' o '/')
    this.router.navigate(['/']).then((sePudoNavegar) => {
      if (!sePudoNavegar) {
        console.log('Logout cancelado por cambios sin guardar');
        return;
      }

      this.tokenService.clear();
      this.estadoRefresh = false;
      this.refreshTokenSubject.next(null);

      sessionStorage.removeItem('logueado');

      this.authChangeSubject.next();

      if (!disparadoPorOtraPestania) {

        localStorage.setItem('logout', Date.now().toString());

        // Avisar al backend
        this.http.post(`${this.AUTH_URL}/logout`, {}, { withCredentials: true })
          .subscribe({
            next: () => console.log('Sesión cerrada en el servidor'),
            error: (err) => console.log('Error al cerrar sesión:', err),
            complete: () => {
              // cuando ya terminó todo el flujo
              this.logoutEnProgreso = false;
            }
          });
      }

      // Y ahora sí lo mandás al login / inicio público
    });
  }

  enviarRecuperarPass(email: string){   
    return this.http.post(`${this.AUTH_URL}/password`,{email});
  }

  restaurarPass(token: string, nuevaPassword: string){
    return this.http.patch(`${this.AUTH_URL}/password/${token}`,{nuevaPassword});
  }

  //----------------------

  isRefreshActivo(): boolean {
    return this.estadoRefresh;
  }

  setEstadoRefresh(value: boolean): void {
    this.estadoRefresh = value;
  }

  getRefreshTokenSubject(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }

  isAuthenticated(): boolean {
    return this.tokenService.obtenerToken() !== null;
  }

}