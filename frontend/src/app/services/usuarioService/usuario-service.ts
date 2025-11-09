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

  cambiarPass(nuevaPass: string){
    return this.http.patch(`${this.USUARIO_URL}/password`, {nuevaPass})
  }

  
}