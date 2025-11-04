import { Injectable } from '@angular/core';
import { DatosToken } from '../../models/datosTokenModel';

@Injectable({ providedIn: 'root' })
export class TokenService {
  
   // Guardamos el access token únicamente en memoria (RAM de la SPA).

  private accessToken: string | null = null;

  // Guarda o reemplaza el token en memoria. 
  guardarToken(token: string | null): void {
    this.accessToken = token;
  }

  // Devuelve el token actual (o null si no hay). 
  obtenerToken(): string | null {
    return this.accessToken;
  }

  // Borra el token de memoria. 
  borrarToken(): void {
    this.accessToken = null;
  }


  set(token: string | null): void { 
    this.guardarToken(token); 
  }
  get(): string | null {
    return this.obtenerToken(); 
  }
  clear(): void { this.borrarToken(); }

  
  // Decodifica la parte Base64URL a texto UTF-8.

  obtenerRoles(): string[] {
    return (this.obtenerDatosDelToken()?.roles ?? []).map(r => r.authority);
  }

  tieneRol(rol : string) : boolean{
    return this.obtenerRoles().includes(rol)
  }

  private decodificarBase64Url(cadena: string): string {
    let base64 = cadena.replace(/-/g, '+').replace(/_/g, '/');
    const resto = base64.length % 4;
    if (resto) base64 += '='.repeat(4 - resto);

    const binario = atob(base64);
    const bytes = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  // Lee datos del usuario del JWT y lo devuelve como objeto.
  private obtenerDatosDelToken(): DatosToken| null {
    if (!this.accessToken) return null;

    try {
      const partes = this.accessToken.split('.');
      if (partes.length < 2) return null; // token mal formado

      const datosCodificados = partes[1];
      const json = this.decodificarBase64Url(datosCodificados);
      return JSON.parse(json) as DatosToken;
    } catch {
      return null;
    }
  }

}
