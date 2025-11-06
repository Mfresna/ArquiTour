import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../tokenService/token-service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthResponse } from '../../models/login/authResponseModel';
import { AuthRequest } from '../../models/login/authRequestModel';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { LoginForm } from '../../models/login/loginFormModel';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly AUTH_URL = `${environment.apiUrl}/auth`;

  //Maneja la existencia de un refresh activo
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
 
  constructor(
    private http: HttpClient, 
    private tokenService: TokenService,
    private router: Router ) {}

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
      })
    );
  }

    refreshToken(){
      console.log('🔄 Intentando refrescar el token...');
      
      return this.http.post<AuthResponse>(
        `${this.AUTH_URL}/refresh`,
        {},  // Body vacío
        { withCredentials: true }  // Envía la cookie automáticamente
      ).pipe(
        tap(res => {
          console.log('✅ Token refrescado exitosamente');
          this.tokenService.set(res.accessToken);
          this.refreshTokenSubject.next(res.accessToken);
          this.refreshTokenInProgress = false;
        }),
        catchError(error => {
          console.error('❌ Error al refrescar token, cerrando sesión');
          this.refreshTokenInProgress = false;
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    console.log('👋 Cerrando sesión');
    this.tokenService.clear();
    this.refreshTokenSubject.next(null);

    // Llamar al backend para invalidar el refreshToken
    this.http.post(`${this.AUTH_URL}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => console.log('Sesión cerrada en el servidor'),
        error: (err) => console.log('Error al cerrar sesión:', err)
      });

    this.router.navigate(['/login']);
  }
  

  enviarRecuperarPass(email: string){   
    return this.http.post(`${this.AUTH_URL}/password`,{email});
  }

  restaurarPass(token: string, nuevaPassword: string){
    return this.http.patch(`${this.AUTH_URL}/password/${token}`,{nuevaPassword});
  }



  //----------------------

    isRefreshTokenInProgress(): boolean {
    return this.refreshTokenInProgress;
  }

  setRefreshTokenInProgress(value: boolean): void {
    this.refreshTokenInProgress = value;
  }

  getRefreshTokenSubject(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }

  isAuthenticated(): boolean {
    return this.tokenService.obtenerToken() !== null;
  }


  // /** Ejemplo de refresh si tuvieras /auth/refresh que devuelve { accessToken } */
  // refresh(): Observable<{ accessToken: string }> {
  //   return this.http.post<{ accessToken: string }>(`${this.baseUrl}/refresh`, {}, {
  //     withCredentials: true,
  //   })
  //   .pipe(
  //     tap(res => this.tokenService.set(res.accessToken))
  //   );
  // }

  // logout(): void {
  //   this.tokenService.clear();

  //   this.http.post<{ accessToken: string }>(`${this.AUTH_URL}/logout`, {}, {
  //     withCredentials: true,
  //   })
  // }
}