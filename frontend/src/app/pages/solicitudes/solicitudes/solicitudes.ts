import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { SolicitudService } from '../../../services/solicitudService/solicitud-service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EstadoSolicitudDescripcion, EstadoSolicitudModel } from '../../../models/solicitudModels/estadoSolicitudModel';
import { SolicitudResponseModel } from '../../../models/solicitudModels/solicitudResponseModel';
import { TipoSolicitudDescripcion, TipoSolicitudModel } from '../../../models/solicitudModels/tipoSolicitudModel';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RolesEnum } from '../../../models/usuarioModels/rolEnum';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { UsuarioModel } from '../../../models/usuarioModels/usuarioModel';
import { finalize } from 'rxjs';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';

@Component({
  selector: 'app-solicitudes',
  imports: [ReactiveFormsModule, CommonModule, EsperandoModal],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes implements OnInit {

filtro!: FormGroup;

  solicitudes: SolicitudResponseModel[] = [];
  TipoSolicitudModel = TipoSolicitudModel;
  TipoSolicitudDescripcion = TipoSolicitudDescripcion;

  EstadoSolicitudModel = EstadoSolicitudModel;
  EstadoSolicitudDescripcion = EstadoSolicitudDescripcion;

  esAdminActual = false;
  soloMias = false;

  cargando = false;
  spinerVisible = false;

  //Administrador por defecto
  esAdminDefault = false;

  mensajeSinResultados: string | null = null;

  // id del usuario logueado (para saber qué solicitudes son “mías”)
  private usuarioActualId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private tokenService: TokenService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      tipo: [''],
      estado: [''],
      fechaDesde: [''],
      fechaHasta: [''],
    });

    this.esAdminActual = this.tokenService.isAdmin();

    // Primero obtengo el usuario actual y después cargo solicitudes
    this.usuarioService.getUsuarioMe().subscribe({
      next: (u: UsuarioModel) => {
        this.usuarioActualId = u.id;
        this.cargarSolicitudes();
      },
      error: () => {
        // Si fallara por algún motivo, igualmente cargo la lista
        this.cargarSolicitudes();
      }
    });

    //Carga si el usuario es Admin Default
    this.adminDefault();
  }

  // =================== CARGA / FILTRO ===================

  cargarSolicitudes(): void {
    const f = this.filtro.value;

    this.cargando = true;
    this.spinerVisible = true; 
    this.mensajeSinResultados = null; 

    // Si es admin y está activado "soloMias", filtramos por su usuarioId
    let usuarioIdParam: number | undefined = undefined;
    if (this.esAdminActual && this.soloMias && this.usuarioActualId != null) {
      usuarioIdParam = this.usuarioActualId;
    }

    this.solicitudService
      .filtrarSolicitudes(
        f.tipo || undefined,
        f.estado || undefined,
        usuarioIdParam,  
        undefined,           // adminAsignadoId
        f.fechaDesde || undefined,
        f.fechaHasta || undefined,
        undefined            // asignada
      )
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.spinerVisible = false;   
        })
      )
      .subscribe({
        next: (lista) => {
          this.solicitudes = lista;
          this.cargando = false;
          const hayFiltrosActivos =
            !!(f.tipo || f.estado || f.fechaDesde || f.fechaHasta || (this.esAdminActual && this.soloMias));

          if (lista.length === 0) {
            this.mensajeSinResultados = hayFiltrosActivos
              ? 'No se encontraron solicitudes con los filtros seleccionados.'
              : 'No hay solicitudes para mostrar.';
          } else {
            this.mensajeSinResultados = null;
          }
        },
        error: () => {
          this.cargando = false;
          this.spinerVisible = false;
          this.solicitudes = [];
          this.mensajeSinResultados = 'Ocurrió un error al cargar las solicitudes.';  
        }
      });
  }

  aplicarFiltro(): void {
    this.cargarSolicitudes();
  }

  limpiarFiltro(): void {
    this.filtro.reset({
      tipo: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    this.cargarSolicitudes();
  }
    //Alternar entre "Mis solicitudes" y "Ver todas"
  toggleMisSolicitudes(): void {
    if (!this.esAdminActual) return;

    this.soloMias = !this.soloMias;
    this.cargarSolicitudes();
  }
  // =================== HELPERS: ¿es mi solicitud? ===================

  private esMia(s: SolicitudResponseModel): boolean {
    if (this.usuarioActualId == null) return false;

    // Uso idUsuario (que trajiste en el modelo); si por algún motivo
    // no estuviera, podés usar s.usuario?.id como respaldo.
    return s.idUsuario === this.usuarioActualId

  }

  // =================== HELPERS DE ESTADO (solo MIS solicitudes) ===================

  /** true si YO ya tengo una ALTA_ARQUITECTO pendiente/en proceso */
  private tieneAltaArquitectoPendiente(): boolean {
    return this.solicitudes.some(s =>
      this.esMia(s) &&
      s.tipoSolicitud === TipoSolicitudModel.ALTA_ARQUITECTO &&
      (s.estado === EstadoSolicitudModel.PENDIENTE ||
       s.estado === EstadoSolicitudModel.EN_PROCESO)
    );
  }

  /** true si YO ya tengo una BAJA_ROL pendiente/en proceso para ARQUITECTO */
  private tieneBajaArquitectoPendiente(): boolean {
    return this.solicitudes.some(s =>
      this.esMia(s) &&
      s.tipoSolicitud === TipoSolicitudModel.BAJA_ROL &&
      s.rolBaja === RolesEnum.ROLE_ARQUITECTO &&
      (s.estado === EstadoSolicitudModel.PENDIENTE ||
       s.estado === EstadoSolicitudModel.EN_PROCESO)
    );
  }

  /** true si YO ya tengo una BAJA_ROL pendiente/en proceso para ADMINISTRADOR */
  private tieneBajaAdminPendiente(): boolean {
    return this.solicitudes.some(s =>
      this.esMia(s) &&
      s.tipoSolicitud === TipoSolicitudModel.BAJA_ROL &&
      s.rolBaja === RolesEnum.ROLE_ADMINISTRADOR &&
      (s.estado === EstadoSolicitudModel.PENDIENTE ||
       s.estado === EstadoSolicitudModel.EN_PROCESO)
    );
  }

  // =================== NUEVA SOLICITUD (botón +) ===================

  puedeCrearSolicitud(): boolean {

    if(this.esAdminDefault){
      return false;
    }

    const esArq   = this.tokenService.isArquitecto();
    const esAdmin = this.tokenService.isAdmin();

    const puedeAltaArq   = !esArq && !this.tieneAltaArquitectoPendiente();
    const puedeBajaArq   = esArq   && !this.tieneBajaArquitectoPendiente();
    const puedeBajaAdmin = esAdmin && !this.tieneBajaAdminPendiente();

    return puedeAltaArq || puedeBajaArq || puedeBajaAdmin;
  }

  private adminDefault(): void{
    this.usuarioService.esAdminDefault()
    .subscribe({
        next: (valor) => {this.esAdminDefault = valor},
        error: (err) => {
          console.error("Error al consultar el admin default", err);
        }
      });
  }


  irANuevaSolicitud(): void {
    if (!this.puedeCrearSolicitud()) return;

    const esArq   = this.tokenService.isArquitecto();
    const esAdmin = this.tokenService.isAdmin();

    const puedeAltaArq   = !esArq && !this.tieneAltaArquitectoPendiente();
    const puedeBajaArq   = esArq   && !this.tieneBajaArquitectoPendiente();
    const puedeBajaAdmin = esAdmin && !this.tieneBajaAdminPendiente();

    let tipo: TipoSolicitudModel;
    let rolBaja: RolesEnum | null = null;
    let modoDual = false;
    let altaHabilitada = false;
    let bajaAdminHabilitada = false;

    // ===== CASO ESPECIAL: ADMIN que NO es arquitecto (tabs ALTA / BAJA ADMIN en el form) =====
    if (esAdmin && !esArq) {
      altaHabilitada = puedeAltaArq;
      bajaAdminHabilitada = puedeBajaAdmin;

      if (altaHabilitada && bajaAdminHabilitada) {
        modoDual = true;
        tipo = TipoSolicitudModel.ALTA_ARQUITECTO; // default al entrar al form
      } else if (altaHabilitada) {
        tipo = TipoSolicitudModel.ALTA_ARQUITECTO;
      } else if (bajaAdminHabilitada) {
        tipo = TipoSolicitudModel.BAJA_ROL;
        rolBaja = RolesEnum.ROLE_ADMINISTRADOR;
      } else {
        return;
      }

      const queryParams: any = { tipo };

      if (modoDual) {
        queryParams.modoDual = true;
        queryParams.altaHabilitada = altaHabilitada;
        queryParams.bajaAdminHabilitada = bajaAdminHabilitada;
      } else if (rolBaja) {
        queryParams.rolBaja = rolBaja;
      }

      this.router.navigate(['/formSolicitudes'], { queryParams });
      return;
    }

    // ===== RESTO DE CASOS =====

    // 1) Usuario común (no arq, no admin) -> solo ALTA_ARQUITECTO
    if (!esArq && !esAdmin && puedeAltaArq) {
      tipo = TipoSolicitudModel.ALTA_ARQUITECTO;
    }
    // 2) Solo arquitecto -> BAJA rol ARQUITECTO
    else if (esArq && !esAdmin && puedeBajaArq) {
      tipo = TipoSolicitudModel.BAJA_ROL;
      rolBaja = RolesEnum.ROLE_ARQUITECTO;
    }
    // 3) Arquitecto + Admin -> solo BAJAS, sin confirm()
    else if (esArq && esAdmin) {
      const rolesDisponibles: RolesEnum[] = [];
      if (puedeBajaArq)   rolesDisponibles.push(RolesEnum.ROLE_ARQUITECTO);
      if (puedeBajaAdmin) rolesDisponibles.push(RolesEnum.ROLE_ADMINISTRADOR);

      if (rolesDisponibles.length === 0) {
        return; // no hay nada que pueda pedir
      }

      tipo = TipoSolicitudModel.BAJA_ROL;

      // si solo un rol es posible, lo mando preseleccionado;
      // si hay dos, dejo que el form muestre el select con ambos.
      if (rolesDisponibles.length === 1) {
        rolBaja = rolesDisponibles[0];
      }
    }
    else {
      return;
    }

    const queryParams: any = { tipo };
    if (tipo === TipoSolicitudModel.BAJA_ROL && rolBaja) {
      queryParams.rolBaja = rolBaja;
    }

    this.router.navigate(['/formSolicitudes'], { queryParams });
  }

  // =================== DETALLE ===================

  verDetalle(s: SolicitudResponseModel): void {
    if (!s.id) { return; }
    this.router.navigate(['/solicitudes', s.id]);
  }
  


}
