import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/authService/auth-service';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { TemaService } from '../../services/temaService/tema-service';
import { Observable } from 'rxjs';
import { NotificacionService } from '../../services/notificacionService/notificacion-service';
import { AsyncPipe } from '@angular/common';
import { NotificacionResponseModel } from '../../models/notificacionModels/notificacionResponseModel';
import { TipoNotificacionDescripcion, TipoNotificacionEnum } from '../../models/notificacionModels/tipoNotificacionEnum';
import { MensajeModal } from '../mensaje-modal/mensaje-modal';
import { UsuarioModel } from '../../models/usuarioModels/usuarioModel';
import { environment } from '../../../environments/environment';
import { UsuarioService } from '../../services/usuarioService/usuario-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe, MensajeModal],
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

  notificaciones: NotificacionResponseModel[] = [];

  TipoNotificacionEnum = TipoNotificacionEnum;
  TipoNotificacionDescripcion = TipoNotificacionDescripcion;

  //MODAL
  modalVisible: boolean = false;
  modalTitulo!: string;
  modalMensaje!: string;

  //IMAGEN
  imagenDefecto = `${environment.imgUsuario}`;
  imagenPerfilUrl: string = '';
  usuarioActual: UsuarioModel | null = null;

  //MENU HAMBURGUESA
  menuLateralAbierto: boolean = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private elementRef: ElementRef,
    private temaService: TemaService,
    private notificacionService: NotificacionService,
    private router: Router,
    private usuarioService: UsuarioService
  ){
    //Se construye con la imagen por defecto y si puede (pq ya estoy logueado) carga la img perfil
    this.imagenPerfilUrl = this.buildImagenDefecto();
    this.cargarUsuarioActual();

  }

  ngOnInit(): void {
    const temaActual = document.documentElement.getAttribute('data-tema');
    this.modoNoche = temaActual === 'oscuro';

    this.cantNotifSinLeer$ = this.notificacionService.cantNotifSinLeer$;

    this.router.events.subscribe(() => {
      this.isBienvenida = this.router.url === '/bienvenida';
    });

    this.notificacionService.refrescarManual(); //Actualiza la campana de notificaciones ni bien inicia el header

    this.authService.authChange$.subscribe(() => {
      if (this.isLogged()) {
        this.cargarUsuarioActual();
      } else {
        this.usuarioActual = null;
        this.imagenPerfilUrl = this.buildImagenDefecto();
      }
    });

  }

  cerrarSesion(){
    this.cerrarTodosMenus();
    this.authService.logout();
    this.usuarioActual = null;
    this.imagenPerfilUrl = this.buildImagenDefecto();
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

  toggleMenuLateral() {
    this.menuLateralAbierto = !this.menuLateralAbierto;
  }

  cerrarMenuLateral() {
    this.menuLateralAbierto = false;
  }


  cerrarTodosMenus(){
    this.estudiosMenu = false;
    this.usuarioMenu = false;
    this.obrasMenu = false;
    this.mapaMenu=false;
    this.notificacionesMenu = false;
    this.menuLateralAbierto = false;
  }

  //================= NOTIFICACIONES

  abrirNotificaciones() {
    this.toggleNotificacionesMenu();

    this.notificacionService.refrescarManual();
    
    this.traerNotificaciones();
  }

  private traerNotificaciones(){
    this.notificacionService.getNotificacionesRecibidas()
    .subscribe({
      next: (notifs) => {
        this.notificaciones = notifs;
      },
      error: err => console.error(err)
    });
  }

  seleccionarNotificacion(notif: NotificacionResponseModel){

    this.marcarNotificacionLeida(notif.id);

    if(notif.referenciaId != null){
      this.router.navigate(['/solicitudes', notif.referenciaId]);
    }else{
      //Mostrar modal 
      this.modalVisible = true;
      this.modalTitulo = TipoNotificacionDescripcion[notif.tipo]
      this.modalMensaje = notif.mensaje
    }

  }

  private marcarNotificacionLeida(id: number){
    this.notificacionService.marcarNotificacionLeida(id.toString()).subscribe({

    });
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

   // ========== AVATAR (NUEVO) ==========

  private cargarUsuarioActual(): void {
    this.usuarioService.getUsuarioMe().subscribe({
      next: (u: UsuarioModel) => {
        this.usuarioActual = u;

        if (u.urlImagen) {
          const path = u.urlImagen.startsWith('/') ? u.urlImagen : `/${u.urlImagen}`;
          this.imagenPerfilUrl = `${environment.apiUrl}${path}`;
        } else {
          this.imagenPerfilUrl = this.buildImagenDefecto();
        }
      },
      error: () => {
        // Si no está logueado o hay error, usamos la default
        this.usuarioActual = null;
        this.imagenPerfilUrl = this.buildImagenDefecto();
      }
    });
  }

  private buildImagenDefecto(): string {
    // igual que en UsuarioDetalle
    return `${location.origin}/${this.imagenDefecto.replace(/^\/+/, '')}`;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return;

    img.onerror = null;
    //img.src = this.buildImagenDefecto();
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