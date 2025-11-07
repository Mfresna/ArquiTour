import { Component, OnDestroy, OnInit } from '@angular/core';
import { Login } from "../login/login";
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, Login, Register],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit, OnDestroy {
  
  imagenes: string[] = [
    'assets/img/bg1.jpg',
    'assets/img/bg2.jpg',
    'assets/img/bg3.jpg',
    'assets/img/bg4.jpg'
  ];

  vistaActual: string = 'inicio';

  imagenActualIndex: number = 0;
  imagenActual: string = this.imagenes[0];
  imagenSiguiente: string = this.imagenes[1];
  
  private intervalo: any;
  private duracionTransicion = 6000; // 6 segundos entre cambios

  
  private transicionMs = 2000; // Debe coincidir con el CSS
  private enTransicion = false;

  ngOnInit(): void {
    this.iniciarCarousel();
  }
  
  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  a():void{
    alert("HOLA");
  }
  
  iniciarCarousel(): void {
    //Arma el intervalo -> cada cuanto de ejecutará cambiar de imagen
    this.intervalo = setInterval(() => {
      this.cambiarImagen();
    }, this.duracionTransicion);
  }
  
  // cambiarImagen(): void {
  //   // Calcular siguiente índice
  //   const siguienteIndex = (this.imagenActualIndex + 1) % this.imagenes.length;
    
  //   // Actualizar imágenes
  //   this.imagenActual = this.imagenes[this.imagenActualIndex];
  //   this.imagenSiguiente = this.imagenes[siguienteIndex];
    
  //   // Actualizar índice
  //   this.imagenActualIndex = siguienteIndex;
    
  //   // Trigger de la animación CSS
  //   const bgActual = document.querySelector('.background-image.actual') as HTMLElement;
  //   const bgSiguiente = document.querySelector('.background-image.siguiente') as HTMLElement;
    
  //   if (bgActual && bgSiguiente) {
  //     bgActual.style.opacity = '0';
  //     bgSiguiente.style.opacity = '1';
      
  //     // Después de la transición, intercambiar las clases
  //     setTimeout(() => {
  //       if (bgActual && bgSiguiente) {
  //         bgActual.style.opacity = '0';
  //         bgSiguiente.style.opacity = '1';
  //       }
  //     }, 2000); // Duración del fade
  //   }
  // }

cambiarImagen(): void {
  if (this.enTransicion) return; // evita solapamientos
  this.enTransicion = true;

  // 1) Calcular siguiente índice y URL
  const siguienteIndex = (this.imagenActualIndex + 1) % this.imagenes.length;
  const siguienteUrl = this.imagenes[siguienteIndex];

  // 2) Pre-cargar la imagen siguiente (evita flash)
  const precarga = new Image();
  precarga.src = siguienteUrl;
  const continuar = () => {
    // 3) Actualizar bindings de Angular para que el DIV "siguiente" tenga el fondo correcto
    this.imagenSiguiente = siguienteUrl;

    // 4) Tomar referencias a las capas
    const bgActual = document.querySelector('.background-image.actual') as HTMLElement;
    const bgSiguiente = document.querySelector('.background-image.siguiente') as HTMLElement;
    if (!bgActual || !bgSiguiente) {
      this.enTransicion = false;
      return;
    }

    // 5) Estado inicial de opacidades por si quedaron sucias
    bgActual.style.opacity = '1';
    bgSiguiente.style.opacity = '0';

    // 6) Forzar reflow para que el navegador “registre” el estado inicial
    //    y luego sí aplique la transición al cambiar la opacidad.
    //    (cualquier lectura de layout sirve)
    void bgSiguiente.offsetWidth;

    // 7) Disparar el crossfade
    bgActual.style.opacity = '0';
    bgSiguiente.style.opacity = '1';

    // 8) Al terminar la transición, consolidar el cambio
    const onEnd = () => {
      bgSiguiente.removeEventListener('transitionend', onEnd);

      // “siguiente” pasa a ser la nueva “actual”
      this.imagenActualIndex = siguienteIndex;
      this.imagenActual = this.imagenSiguiente;

      // Preparar el próximo “siguiente”
      const proximoIndex = (this.imagenActualIndex + 1) % this.imagenes.length;
      const proximaUrl = this.imagenes[proximoIndex];
      this.imagenSiguiente = proximaUrl; // se precargará en el próximo ciclo o lo podés precargar aquí

      // Dejar capas listas para el próximo crossfade:
      // actual visible (1) y siguiente oculta (0)
      bgActual.style.opacity = '1';
      bgSiguiente.style.opacity = '0';

      this.enTransicion = false;
    };

    // Usar 'once: true' para no acumular listeners
    bgSiguiente.addEventListener('transitionend', onEnd, { once: true });
  };

  // Si ya está en caché, onload no dispara; contemplamos ambos casos.
  if (precarga.complete) {
    continuar();
  } else {
    precarga.onload = continuar;
  }
}



  
}