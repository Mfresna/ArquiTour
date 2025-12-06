import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/authService/auth-service';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { TemaService } from '../../services/temaService/tema-service';
import { Observable } from 'rxjs';
import { NotificacionService } from '../../services/notificacionService/notificacion-service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit{

  modoNoche: boolean = false;

  usuarioMenu: boolean = false;
  obrasMenu: boolean = false;
  estudiosMenu: boolean = false;
  mapaMenu: boolean = false;
  notificacionesMenu: boolean = false;

  cantNotifSinLeer$!: Observable<number>;

  isBienvenida: boolean = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private elementRef: ElementRef,
    private temaService: TemaService,
    private notificacionService: NotificacionService,
    private router: Router
  ){}

  ngOnInit(): void {
    const temaActual = document.documentElement.getAttribute('data-tema');
    this.modoNoche = temaActual === 'oscuro';

    this.cantNotifSinLeer$ = this.notificacionService.cantNotifSinLeer$;

    this.router.events.subscribe(() => {
      this.isBienvenida = this.router.url === '/bienvenida';
    });
  }

  cerrarSesion(){
    this.cerrarTodosMenus();
    this.authService.logout();
  }

  isAdmin(): boolean{
    return this.tokenService.isAdmin();
  }

  isArq(): boolean{
    return this.tokenService.isArquitecto();
  }

  isLogged(): boolean {
    return this.tokenService.get() !== null;
  }


  //=========== TOGGLE MENUS
  toggleModoNoche(){
    this.modoNoche = !this.modoNoche;   
    this.temaService.toggleTema();
  }

  toggleUsuarioMenu(){
    this.usuarioMenu = !this.usuarioMenu;

    this.obrasMenu = false
    this.estudiosMenu = false
    this.mapaMenu=false;
    this.notificacionesMenu = false;
  }

  toggleObrasMenu(){
    this.obrasMenu = !this.obrasMenu;

    this.usuarioMenu = false;
    this.estudiosMenu = false;
    this.mapaMenu=false;
    this.notificacionesMenu = false;

  }

  toggleEstudiosMenu(){
    this.estudiosMenu = !this.estudiosMenu;

    this.usuarioMenu = false
    this.obrasMenu = false;
    this.mapaMenu=false;
    this.notificacionesMenu = false;
  }

  toggleMapaMenu(){
    this.mapaMenu = !this.mapaMenu;

    this.usuarioMenu = false;
    this.obrasMenu = false;
    this.estudiosMenu = false;
    this.notificacionesMenu = false;
  }

  toggleNotificacionesMenu(){
    this.notificacionesMenu = !this.notificacionesMenu;

    this.usuarioMenu = false;
    this.obrasMenu = false;
    this.mapaMenu=false;
    this.estudiosMenu = false;
  }

  cerrarTodosMenus(){
    this.estudiosMenu = false;
    this.usuarioMenu = false;
    this.obrasMenu = false;
    this.mapaMenu=false;
    this.notificacionesMenu = false;

  }

  //================= NOTIFICACIONES

  abrirNotificaciones() {
    this.toggleNotificacionesMenu();

    this.notificacionService.refrescarManual();
    //hacer el subscribe para verlas
  }

  marcarTodasLeidas() {
    this.notificacionService.marcarTodasLeidas().subscribe({
      next: () => {
        console.log("Todas marcadas como leídas");
      },
      error: err => {
        console.error(err);
        alert("Hay notificaciones que no pueden ser marcadas como leidas.")
      }
    });
  }
  
  //========== ESCUCHADORES
  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: any) { 
      
    this.cerrarTodosMenus();

  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {

    // Usamos ElementRef para verificar si el clic fue dentro o fuera de nuestro componente.
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    // Si el clic fue FUERA, cerramos el menú.
    if (!clickedInside) {
      this.cerrarTodosMenus();
    }
  
  }


}