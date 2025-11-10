import { Component, OnDestroy, OnInit } from '@angular/core';
import { Login } from "../login/login";
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, Login, Register],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit, OnDestroy {
  
  imagenes: string[] = environment.imagenesFondo;
  imagSeleccionada!: string;

  vistaActual: 'inicio' | 'login' | 'registro' = 'inicio';
  

  constructor(
    private router: Router){}

  ngOnInit(): void {
    const indiceImagen = Math.floor(Math.random() * this.imagenes.length); 
    this.imagSeleccionada = this.imagenes[indiceImagen];

    if (this.router.url.includes('/login')) {
      this.vistaActual = 'login';
    }else if(this.router.url.includes('/registro')){
      this.vistaActual = 'registro';
    }

  }
  
  ngOnDestroy(): void {
    this.imagSeleccionada = '';
  }

  
}