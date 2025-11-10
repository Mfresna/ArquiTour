import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly USUARIO_URL = `${environment.apiUrl}/usuario`;


  constructor(
    private http: HttpClient
  ){}

  crearUsuario(formulario: string){

    






    return this.http.patch(`${this.USUARIO_URL}/password`, {formulario})
  }



  //NO TOCAR
  cambiarPass(nuevaPass: string){
    return this.http.patch(`${this.USUARIO_URL}/password`, {nuevaPass})
  }

  
}



  // login(formulario: LoginForm){

  //   //Mapeo de atributos
  //   let credenciales: AuthRequest = {
  //     username: formulario.email,
  //     password: formulario.password
  //   };

  //   return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, credenciales, {
  //     withCredentials: true,
  //   }).pipe(
  //     tap(res => {
  //       this.tokenService.set(res.accessToken);
  //       this.refreshTokenSubject.next(res.accessToken);
  //     })
  //   );
  // }