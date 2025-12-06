import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { SolicitudService } from '../../../services/solicitudService/solicitud-service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EstadoSolicitudModel } from '../../../models/solicitudModels/estadoSolicitudModel';
import { SolicitudResponseModel } from '../../../models/solicitudModels/solicitudResponseModel';
import { TipoSolicitudModel } from '../../../models/solicitudModels/tipoSolicitudModel';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RolesEnum } from '../../../models/usuarioModels/rolEnum';

@Component({
  selector: 'app-solicitudes',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes implements OnInit {

    filtro!: FormGroup;

  solicitudes: SolicitudResponseModel[] = [];
  TipoSolicitudModel = TipoSolicitudModel;
  EstadoSolicitudModel = EstadoSolicitudModel;

  cargando = false;

  constructor(
    private fb: FormBuilder,
    private solicitudService: SolicitudService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      tipo: [''],
      estado: [''],
      fechaDesde: [''],
      fechaHasta: [''],
    });

    this.cargarSolicitudes();
  }

  // =================== CARGA / FILTRO ===================

  cargarSolicitudes(): void {
    const f = this.filtro.value;

    this.cargando = true;

    this.solicitudService
      .filtrarSolicitudes(
        f.tipo || undefined,
        f.estado || undefined,
        undefined,                     // usuarioId
        undefined,                     // adminAsignadoId
        f.fechaDesde || undefined,
        f.fechaHasta || undefined,
        undefined                      // asignada
      )
      .subscribe({
        next: (lista) => {
          this.solicitudes = lista;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
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

  // =================== HELPERS DE ESTADO ===================

  /** true si ya hay una ALTA_ARQUITECTO pendiente/en proceso */
  private tieneAltaArquitectoPendiente(): boolean {
    return this.solicitudes.some(s =>
      s.tipoSolicitud === TipoSolicitudModel.ALTA_ARQUITECTO &&
      (s.estado === EstadoSolicitudModel.PENDIENTE ||
       s.estado === EstadoSolicitudModel.EN_PROCESO)
    );
  }

  /** true si ya hay una BAJA_ROL pendiente/en proceso para ARQUITECTO */
  private tieneBajaArquitectoPendiente(): boolean {
    return this.solicitudes.some(s =>
      s.tipoSolicitud === TipoSolicitudModel.BAJA_ROL &&
      s.rolBaja === RolesEnum.ROLE_ARQUITECTO &&
      (s.estado === EstadoSolicitudModel.PENDIENTE ||
       s.estado === EstadoSolicitudModel.EN_PROCESO)
    );
  }

  /** true si ya hay una BAJA_ROL pendiente/en proceso para ADMINISTRADOR */
  private tieneBajaAdminPendiente(): boolean {
    return this.solicitudes.some(s =>
      s.tipoSolicitud === TipoSolicitudModel.BAJA_ROL &&
      s.rolBaja === RolesEnum.ROLE_ADMINISTRADOR &&
      (s.estado === EstadoSolicitudModel.PENDIENTE ||
       s.estado === EstadoSolicitudModel.EN_PROCESO)
    );
  }

  // =================== NUEVA SOLICITUD (botón +) ===================

  /**
   * Habilita o no el botón según TODAS las reglas:
   * - Si NO sos ARQ ni ADMIN => podés pedir ALTA_ARQUITECTO (si no hay alta pendiente)
   * - Si sos ARQ => podés pedir BAJA_ROL de ARQUITECTO (si no hay baja ARQ pendiente)
   * - Si sos ADMIN => podés pedir BAJA_ROL de ADMIN (si no hay baja ADMIN pendiente)
   * - Si sos ARQ y ADMIN => aplica lo anterior para cada rol por separado.
   */
  puedeCrearSolicitud(): boolean {
    const esArq = this.tokenService.isArquitecto();
    const esAdmin = this.tokenService.isAdmin();

    const puedeAltaArq   = !esArq && !esAdmin && !this.tieneAltaArquitectoPendiente();
    const puedeBajaArq   = esArq   && !this.tieneBajaArquitectoPendiente();
    const puedeBajaAdmin = esAdmin && !this.tieneBajaAdminPendiente();

    return puedeAltaArq || puedeBajaArq || puedeBajaAdmin;
  }

  irANuevaSolicitud(): void {
    if (!this.puedeCrearSolicitud()) return;

    const esArq = this.tokenService.isArquitecto();
    const esAdmin = this.tokenService.isAdmin();

    const puedeAltaArq   = !esArq && !esAdmin && !this.tieneAltaArquitectoPendiente();
    const puedeBajaArq   = esArq   && !this.tieneBajaArquitectoPendiente();
    const puedeBajaAdmin = esAdmin && !this.tieneBajaAdminPendiente();

    let tipo: TipoSolicitudModel;
    let rolBaja: RolesEnum | null = null;

    // 1) Usuario común (no ARQ ni ADMIN) -> ALTA ARQUITECTO
    if (puedeAltaArq) {
      tipo = TipoSolicitudModel.ALTA_ARQUITECTO;
    }
    // 2) Solo ARQ -> BAJA rol ARQUITECTO
    else if (esArq && !esAdmin && puedeBajaArq) {
      tipo = TipoSolicitudModel.BAJA_ROL;
      rolBaja = RolesEnum.ROLE_ARQUITECTO;
    }
    // 3) Solo ADMIN -> BAJA rol ADMINISTRADOR
    else if (!esArq && esAdmin && puedeBajaAdmin) {
      tipo = TipoSolicitudModel.BAJA_ROL;
      rolBaja = RolesEnum.ROLE_ADMINISTRADOR;
    }
    // 4) ARQ y ADMIN
    else if (esArq && esAdmin) {

      const opcionesDisponibles: { rol: RolesEnum; label: string }[] = [];

      if (puedeBajaArq) {
        opcionesDisponibles.push({ rol: RolesEnum.ROLE_ARQUITECTO, label: 'arquitecto' });
      }
      if (puedeBajaAdmin) {
        opcionesDisponibles.push({ rol: RolesEnum.ROLE_ADMINISTRADOR, label: 'administrador' });
      }

      // Si sólo queda disponible una baja, voy directo a esa
      if (opcionesDisponibles.length === 1) {
        tipo = TipoSolicitudModel.BAJA_ROL;
        rolBaja = opcionesDisponibles[0].rol;
      } else if (opcionesDisponibles.length === 2) {
        // Tenés los dos roles disponibles para baja -> pregunto cuál
        const quiereArq = confirm(
          'Tenés ambos roles.\n\nAceptar: solicitar baja de ARQUITECTO.\nCancelar: solicitar baja de ADMINISTRADOR.'
        );

        tipo = TipoSolicitudModel.BAJA_ROL;
        rolBaja = quiereArq ? RolesEnum.ROLE_ARQUITECTO : RolesEnum.ROLE_ADMINISTRADOR;
      } else {
      
        return;
      }

    } else {
   
      return;
    }

    // Navegación al formulario de solicitudes
    const queryParams: any = { tipo };

    // Si es una baja de rol, mandamos también qué rol quiere dar de baja.
    // (Después lo vas a usar en el form para setear dto.rolAEliminar)
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
  
  //  filtro!: FormGroup;

  // solicitudes: SolicitudResponseModel[] = [];
  // TipoSolicitudModel = TipoSolicitudModel;
  // EstadoSolicitudModel = EstadoSolicitudModel;

  // cargando = false;

  // constructor(
  //   private fb: FormBuilder,
  //   private solicitudService: SolicitudService,
  //   private tokenService: TokenService,
  //   private router: Router
  // ) {}

  // ngOnInit(): void {
  //   this.filtro = this.fb.group({
  //     tipo: [''],
  //     estado: [''],
  //     fechaDesde: [''],
  //     fechaHasta: [''],
  //   });

  //   this.cargarSolicitudes();
  // }

  // // =================== CARGA / FILTRO ===================

  // cargarSolicitudes(): void {
  //   const f = this.filtro.value;

  //   this.cargando = true;

  //   this.solicitudService
  //     .filtrarSolicitudes(
  //       f.tipo || undefined,
  //       f.estado || undefined,
  //       undefined,                     
  //       undefined,                     
  //       f.fechaDesde || undefined,
  //       f.fechaHasta || undefined,
  //       undefined                      
  //     )
  //     .subscribe({
  //       next: (lista) => {
  //         this.solicitudes = lista;
  //         this.cargando = false;
  //       },
  //       error: () => {
  //         this.cargando = false;
  //       }
  //     });
  // }

  // aplicarFiltro(): void {
  //   this.cargarSolicitudes();
  // }

  // limpiarFiltro(): void {
  //   this.filtro.reset({
  //     tipo: '',
  //     estado: '',
  //     fechaDesde: '',
  //     fechaHasta: ''
  //   });
  //   this.cargarSolicitudes();
  // }

  // // =================== NUEVA SOLICITUD (botón +) ===================

  // puedeCrearSolicitud(): boolean {
  //   const esArq = this.tokenService.isArquitecto();

  //   const tieneAltaPendiente = this.solicitudes.some(s =>
  //     s.tipoSolicitud === TipoSolicitudModel.ALTA_ARQUITECTO &&
  //     (s.estado === EstadoSolicitudModel.PENDIENTE || s.estado === EstadoSolicitudModel.EN_PROCESO)
  //   );

  //   const tieneBajaPendiente = this.solicitudes.some(s =>
  //     s.tipoSolicitud === TipoSolicitudModel.BAJA_ROL &&
  //     (s.estado === EstadoSolicitudModel.PENDIENTE || s.estado === EstadoSolicitudModel.EN_PROCESO)
  //   );

  //   if (!esArq) {
  //     // No es arquitecto -> solo puede pedir ALTA si no tiene alta pendiente
  //     return !tieneAltaPendiente;
  //   }

  //   // Es arquitecto -> solo puede pedir BAJA si no tiene baja pendiente
  //   return !tieneBajaPendiente;
  // }

  // irANuevaSolicitud(): void {
  //   if (!this.puedeCrearSolicitud()) return;
  //   const tipo = this.tokenService.isArquitecto()
  //     ? TipoSolicitudModel.BAJA_ROL
  //     : TipoSolicitudModel.ALTA_ARQUITECTO;

  //   this.router.navigate(['/formSolicitudes'], {
  //     queryParams: { tipo }
  //   });
  // }

  // // =================== DETALLE ===================

  // verDetalle(s: SolicitudResponseModel): void {
  //   if (!s.id) { return; }
  //   this.router.navigate(['/solicitudes', s.id]);
  // }

}
