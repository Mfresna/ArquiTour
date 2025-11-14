import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/authService/auth-service';
import { Auth } from "../../auth/pages/autenticacion/auth";
import { TokenService } from '../../auth/services/tokenService/token-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header{

  usuarioMenu: boolean = false;
  modoNoche: boolean = false;

  obrasMenu: boolean = false;

  estudiosMenu: boolean = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private elementRef: ElementRef
  ){}

  cerrarSesion(){
    this.authService.logout();
  }

  isAdmin(): boolean{
    //return this.tokenService.isAdmin();
    return true;
  }

  isArq(): boolean{
    return this.tokenService.isArquitecto();
  }


  //=========== TOGGLE MENUS
  toggleUsuarioMenu(){
    this.usuarioMenu = !this.usuarioMenu;

    this.obrasMenu = false
    this.estudiosMenu = false
  }

  toggleModoNoche(){
    this.modoNoche = !this.modoNoche
  }

  toggleObrasMenu(){
    this.obrasMenu = !this.obrasMenu;

    this.usuarioMenu = false
    this.estudiosMenu = false
  }

  toggleEstudiosMenu(){
    this.estudiosMenu = !this.estudiosMenu;

    this.usuarioMenu = false
    this.obrasMenu = false
  }

  //========== ESCUCHADORES
  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: any) { 
      
    this.usuarioMenu = false;
    this.obrasMenu = false;

  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {

    // Usamos ElementRef para verificar si el clic fue dentro o fuera de nuestro componente.
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    // Si el clic fue FUERA, cerramos el menú.
    if (!clickedInside) {
      this.usuarioMenu = false;
      this.obrasMenu = false;
      this.estudiosMenu = false
    }
  
  }
}
