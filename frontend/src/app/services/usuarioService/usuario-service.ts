import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UsrRequestModel } from '../../auth/models/register/usrRequestModel';
import { UsrFormModel } from '../../auth/models/register/usrFormModel';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../../models/usuarioModels/usuaroModel';
import { UsuarioBasicoModel } from '../../models/usuarioModels/usuarioBasicoModel';
import { UsuarioFormBasicoModel } from '../../models/usuarioModels/usuarioFormBasicoModel';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly USUARIO_URL = `${environment.apiUrl}/usuarios`;


  constructor(
    private http: HttpClient
  ){}

  crearUsuario(formulario: UsrFormModel, imagenPerfil?: File | null) {

    let nuevoUsuario: UsrRequestModel = {
      email: formulario.email,
      password: formulario.nuevaPass,
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      fechaNacimiento: normalizarFecha(formulario.fechaNacimiento), 
      descripcion: formulario.descripcion?.trim() || null,
      imagenUrl: formulario.imagenUrl || null
    } 
    
    const formData = new FormData();

    formData.append(
      'datosUsuario',
      new Blob([JSON.stringify(nuevoUsuario)], { type: 'application/json' })
    );

    if (imagenPerfil) {
      formData.append('imagenPerfil', imagenPerfil, imagenPerfil.name);
    }

    return this.http.post(`${this.USUARIO_URL}/registrarme`, formData);
  }

  actualizarFotoPerfil(url: string){
    return this.http.patch(`${this.USUARIO_URL}/imagenPerfil`, {url});
  }

  actualizarPerfil(formulario: UsuarioFormBasicoModel){

    let actualizarUsr: UsuarioBasicoModel = {
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      fechaNacimiento: normalizarFecha(formulario.fechaNacimiento),
      descripcion: formulario.descripcion?.trim() || null,
      urlImagen: formulario.imagenUrl || null
    }

    return this.http.put(`${this.USUARIO_URL}/${formulario.id}`, actualizarUsr);
  }


  getUsuarios(){

  }
  
  getUsuario(id: string): Observable<UsuarioModel>{
    //Hay que acomodarlo
    return this.http.get<UsuarioModel>(`${this.USUARIO_URL}/${id}`)
  }

  getUsuarioMe(): Observable<UsuarioModel>{
    return this.http.get<UsuarioModel>(`${this.USUARIO_URL}/me`)
  }


  //NO TOCAR
  cambiarPass(nuevaPassword: string){
    return this.http.patch(`${this.USUARIO_URL}/password`, {nuevaPassword})
  }

}

function normalizarFecha(valor: string): string {
  // Si ya está en formato 'YYYY-MM-DD', lo deja igual.
  // Si viene con hora o formato ISO completo, lo corta.
  if (valor.includes('T')) return valor.split('T')[0];

  // Si viene con otro formato, intenta transformarlo.
  const fecha = new Date(valor);
  if (isNaN(fecha.getTime())) return ''; // inválido

  return fecha.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}
