import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/authService/auth-service';
import { Auth } from "../../auth/pages/autenticacion/auth";

@Component({
  selector: 'app-header',
  imports: [RouterLink, Auth],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header{

  usuarioMenu: boolean = false;
  modoNoche: boolean = false;

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef
  ){}

  cerrarSesion(){
    this.authService.logout();
  }



  //=========== TOGGLE MENUS
  toggleUsuarioMenu(){
    this.usuarioMenu = !this.usuarioMenu;
  }

  toggleModoNoche(){
    this.modoNoche = !this.modoNoche
  }


  //========== ESCUCHADORES
  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: any) { 
      
    this.usuarioMenu = false;

  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {

    if (this.usuarioMenu) {
      // Usamos ElementRef para verificar si el clic fue dentro o fuera de nuestro componente.
      const clickedInside = this.elementRef.nativeElement.contains(event.target);
      
      // Si el clic fue FUERA, cerramos el menú.
      if (!clickedInside) {
        this.usuarioMenu = false;
      }
    }
  }
}
