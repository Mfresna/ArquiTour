import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../auth/services/tokenService/token-service';


@Component({
  selector: 'app-prueba-token',
  standalone: true, // ✅ componente standalone
  imports: [CommonModule, FormsModule], // ✅ permite ngIf, ngModel, etc.
  templateUrl: './prueba-token.html',
  styleUrls: ['./prueba-token.css']
})
export class PruebaToken {
  token: string = '';
  resultado: string = '';

  constructor(private tokenService: TokenService, private http: HttpClient) {}

  guardarToken() {
    if (!this.token.trim()) {
      alert('Pegá un token primero.');
      return;
    }
    this.tokenService.guardarToken(this.token.trim());
    this.resultado = '✅ Token guardado en memoria.';
    console.log('Token guardado manualmente.');
  }

  probarApi() {
    this.resultado = '⏳ Haciendo request...';
    this.http.get('http://localhost:8080/estudios/filtrar').subscribe({
      next: (res) => {
        this.resultado = '✅ Respuesta de la API:\n' + JSON.stringify(res, null, 2);
      },
      error: (err) => {
        this.resultado = '❌ Error:\n' + JSON.stringify(err, null, 2);
        console.error(err);
      },
    });
  }

  roles(){
    alert(this.tokenService.obtenerRoles()[0]);
  }
}
