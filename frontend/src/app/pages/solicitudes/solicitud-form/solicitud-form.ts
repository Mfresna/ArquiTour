import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { SolicitudNuevaModel } from '../../../models/solicitudModels/solicitudNuevaModel';
import { TipoSolicitudModel } from '../../../models/solicitudModels/tipoSolicitudModel';
import { RolesEnum } from '../../../models/usuarioModels/rolEnum';
import { SolicitudService } from '../../../services/solicitudService/solicitud-service';
import { DragZoneMultiple } from '../../../components/drag-zone-multiple/drag-zone-multiple';

@Component({
  selector: 'app-solicitud-form',
  imports: [ReactiveFormsModule, MensajeModal, DragZoneMultiple],
  templateUrl: './solicitud-form.html',
  styleUrl: './solicitud-form.css',
})
export class SolicitudForm {
    formulario!: FormGroup;

  // ALTA_ARQUITECTO o BAJA_ROL
  tipo!: TipoSolicitudModel;
  TipoSolicitudModel = TipoSolicitudModel;

  // Rol que se quiere dar de baja (se define a partir de query param / roles)
  rolBajaSeleccionado: RolesEnum | null = null;

  // (opcional, por si más adelante querés mostrar algo en pantalla)
  rolesDisponiblesBaja: { valor: RolesEnum; label: string }[] = [];

  archivos: File[] = [];
  mostrarErrorArchivos = false;

  mensajeDocAlta: string = `
    <strong>Subí la documentación requerida para tu solicitud:<br></strong>
    <span>Título habilitante, constancia de matrícula activa, DNI.</span><br>
    <small class="formats">Formatos permitidos: JPG, PNG, WEBP, PDF</small>
  `;

  cargando = false;

  // ===== MODAL =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';
  redirigirDespues = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.detectarTipoYRol();
    this.initForm();
    this.aplicarValidadoresPorTipo();
    this.configurarCampoRolBajaEnForm(); // solo para mostrar el rol en el form si querés
  }

  // ==================== TIPO + ROL (desde query params) ====================

  private detectarTipoYRol(): void {
    const qp = this.route.snapshot.queryParamMap;

    const paramTipo = qp.get('tipo') as TipoSolicitudModel | null;
    const paramRol  = qp.get('rolBaja') as RolesEnum | null;

    // 1) Determinar tipo de solicitud
    if (paramTipo === TipoSolicitudModel.ALTA_ARQUITECTO ||
        paramTipo === TipoSolicitudModel.BAJA_ROL) {

      this.tipo = paramTipo;
    } else {
      // Fallback automático por rol del usuario:
      // - no arq => ALTA
      // - arq => BAJA
      this.tipo = this.tokenService.isArquitecto()
        ? TipoSolicitudModel.BAJA_ROL
        : TipoSolicitudModel.ALTA_ARQUITECTO;
    }

    // 2) Si es BAJA_ROL, determinar qué rol se quiere dar de baja
    if (this.tipo === TipoSolicitudModel.BAJA_ROL) {

      // Si viene desde el listado con rol ya elegido:
      if (paramRol === RolesEnum.ROLE_ARQUITECTO ||
          paramRol === RolesEnum.ROLE_ADMINISTRADOR) {
        this.rolBajaSeleccionado = paramRol;
        return;
      }

      // Si no vino rol por query param, hacemos fallback según roles del usuario
      const esArq = this.tokenService.isArquitecto();
      const esAdmin = this.tokenService.isAdmin();

      if (esArq && !esAdmin) {
        this.rolBajaSeleccionado = RolesEnum.ROLE_ARQUITECTO;
      } else if (!esArq && esAdmin) {
        this.rolBajaSeleccionado = RolesEnum.ROLE_ADMINISTRADOR;
      } else if (esArq && esAdmin) {
        // Tiene ambos y llegó sin query param -> por defecto ARQUITECTO
        this.rolBajaSeleccionado = RolesEnum.ROLE_ARQUITECTO;
      } else {
        // Usuario sin esos roles -> algo raro, dejamos null
        this.rolBajaSeleccionado = null;
      }
    }
  }

  // ==================== FORM ====================

  private initForm(): void {
    this.formulario = this.fb.group({
      // Alta
      matriculaArquitecto: [''],
      universidad: [''],
      anioRecibido: [''],

      // Baja
      rolBaja: [null],
      motivo: ['']
    });
  }

  private aplicarValidadoresPorTipo(): void {
    const matriculaCtrl = this.formulario.get('matriculaArquitecto');
    const universidadCtrl = this.formulario.get('universidad');
    const anioCtrl = this.formulario.get('anioRecibido');
    const motivoCtrl = this.formulario.get('motivo');
    const rolBajaCtrl = this.formulario.get('rolBaja');

    if (!matriculaCtrl || !universidadCtrl || !anioCtrl || !motivoCtrl || !rolBajaCtrl) return;

    if (this.esAlta()) {
      // Alta: campos obligatorios
      matriculaCtrl.setValidators([Validators.required, Validators.maxLength(50)]);
      universidadCtrl.setValidators([Validators.required, Validators.maxLength(120)]);
      anioCtrl.setValidators([
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear())
      ]);

      motivoCtrl.clearValidators();
      rolBajaCtrl.clearValidators();   // acá no se usa

    } else {
      // Baja
      matriculaCtrl.clearValidators();
      universidadCtrl.clearValidators();
      anioCtrl.clearValidators();

      motivoCtrl.setValidators([Validators.required, Validators.maxLength(280)]);
      rolBajaCtrl.setValidators([Validators.required]);   // <<< obligatorio elegir
    }

    matriculaCtrl.updateValueAndValidity();
    universidadCtrl.updateValueAndValidity();
    anioCtrl.updateValueAndValidity();
    motivoCtrl.updateValueAndValidity();
    rolBajaCtrl.updateValueAndValidity();
  }
  private configurarRolesBaja(): void {
    if (this.tipo !== TipoSolicitudModel.BAJA_ROL) return;

    const roles: { valor: RolesEnum; label: string }[] = [];

    const esArq = this.tokenService.isArquitecto();
    const esAdmin = this.tokenService.isAdmin();

    if (esArq) {
      roles.push({ valor: RolesEnum.ROLE_ARQUITECTO, label: 'Arquitecto' });
    }

    if (esAdmin) {
      roles.push({ valor: RolesEnum.ROLE_ADMINISTRADOR, label: 'Administrador' });
    }

    this.rolesDisponiblesBaja = roles;

    // Si vino un rol por query param y está en la lista, lo selecciono
    const qp = this.route.snapshot.queryParamMap;
    const paramRol = qp.get('rolBaja') as RolesEnum | null;

    let inicial: RolesEnum | null = null;

    if (paramRol && roles.some(r => r.valor === paramRol)) {
      inicial = paramRol;
    } else if (roles.length === 1) {
      // si solo hay 1 rol, lo elijo por defecto
      inicial = roles[0].valor;
    }

    if (inicial) {
      this.formulario.patchValue({ rolBaja: inicial });
      this.rolBajaSeleccionado = inicial;
    }
  }


  private configurarCampoRolBajaEnForm(): void {
    if (this.tipo !== TipoSolicitudModel.BAJA_ROL) return;

    const ctrl = this.formulario.get('rolBaja');
    if (!ctrl || !this.rolBajaSeleccionado) return;

    const label =
      this.rolBajaSeleccionado === RolesEnum.ROLE_ADMINISTRADOR
        ? 'Administrador'
        : 'Arquitecto';

    // solo para mostrarlo en el input deshabilitado
    ctrl.setValue(label);
  }

  esAlta(): boolean {
    return this.tipo === TipoSolicitudModel.ALTA_ARQUITECTO;
  }

  // ==================== ARCHIVOS ====================

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.archivos = Array.from(input.files);
    if (this.archivos.length > 0) {
      this.mostrarErrorArchivos = false;
    }
  }

  onArchivosChange(files: File[]): void {
    this.archivos = files;
    if (this.archivos.length > 0) {
      this.mostrarErrorArchivos = false;
    }
  }

  // ==================== MODAL ====================

  private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info',
    redirigir: boolean = false
  ): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;
    this.redirigirDespues = redirigir;
  }

  onModalAceptar(): void {
    this.modalVisible = false;

    if (this.redirigirDespues) {
      this.router.navigate(['/solicitudes']);
    }

    this.redirigirDespues = false;
  }

  onModalCerrado(): void {
    this.modalVisible = false;
    this.redirigirDespues = false;
  }

  // ==================== ENVIAR ====================

  enviar(event?: Event): void {
    event?.preventDefault();

    this.cargando = true;

    if (this.esAlta()) {
      this.enviarAlta();
    } else {
      this.enviarBaja();
    }
  }

  private enviarAlta(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.cargando = false;
      return;
    }

    if (!this.archivos.length) {
      this.mostrarErrorArchivos = true;
      this.cargando = false;
      return;
    }

    const dto: SolicitudNuevaModel = {
      tipo: TipoSolicitudModel.ALTA_ARQUITECTO,
      matriculaArquitecto: this.formulario.get('matriculaArquitecto')?.value,
      universidad: this.formulario.get('universidad')?.value,
      anioRecibido: this.formulario.get('anioRecibido')?.value
    };

    this.solicitudService.nuevaSolicitud(dto, this.archivos).subscribe({
      next: () => {
        this.cargando = false;
        this.formulario.reset();
        this.archivos = [];
        this.mostrarErrorArchivos = false;

        this.mostrarModal(
          'Solicitud enviada',
          'Tu solicitud para ser arquitecto fue enviada correctamente.',
          'success',
          true
        );
      },
      error: (e) => {
        console.error(e);
        this.cargando = false;

        const msg =
          e?.error?.mensaje ||
          e?.error?.message ||
          'No se pudo enviar la solicitud.';

        this.mostrarModal(
          'Error al enviar',
          msg,
          'error'
        );
      }
    });
  }

    private enviarBaja(): void {
      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        this.cargando = false;
        return;
      }

      const rolSeleccionado: RolesEnum | null = this.formulario.get('rolBaja')?.value;

      if (!rolSeleccionado) {
        this.cargando = false;
        this.mostrarModal(
          'No se puede enviar la solicitud',
          'Debés seleccionar qué rol querés dar de baja.',
          'error'
        );
        return;
      }

      this.rolBajaSeleccionado = rolSeleccionado;

      const dto: SolicitudNuevaModel = {
        tipo: TipoSolicitudModel.BAJA_ROL,
        rolAEliminar: rolSeleccionado,
        motivo: this.formulario.get('motivo')?.value
      };

      this.solicitudService.nuevaSolicitud(dto).subscribe({
        next: () => {
          this.cargando = false;
          this.formulario.reset();

          const textoRol =
            rolSeleccionado === RolesEnum.ROLE_ADMINISTRADOR
              ? 'como administrador'
              : 'como arquitecto';

          this.mostrarModal(
            'Solicitud enviada',
            `Tu solicitud de baja ${textoRol} fue enviada correctamente.`,
            'success',
            true
          );
        },
        error: (e) => {
          console.error(e);
          this.cargando = false;

          const msg =
            e?.error?.mensaje ||
            e?.error?.message ||
            'No se pudo enviar la solicitud.';

          this.mostrarModal(
            'Error al enviar',
            msg,
            'error'
          );
        }
      });
    }


    volver(): void {
      this.router.navigate(['/solicitudes']);
    }

}

  // formulario!: FormGroup;
  // tipo!: TipoSolicitudModel;            // ALTA_ARQUITECTO o BAJA_ROL
  // TipoSolicitudModel = TipoSolicitudModel;

  // archivos: File[] = [];
  // mostrarErrorArchivos = false;
  // mensajeDocAlta: string = `
  //   <strong>Subí la documentación requerida para tu solicitud:<br></strong>
  //   <span>Título habilitante, constancia de matrícula activa, DNI.</span><br>
  //   <small class="formats">Formatos permitidos: JPG, PNG, WEBP, PDF</small>
  // `;

  // cargando = false;

  // // ===== MODAL =====
  // modalVisible = false;
  // modalTitulo = '';
  // modalMensaje = '';
  // modalTipo: MessageType = 'info';
  // redirigirDespues = false;

  // constructor(
  //   private fb: FormBuilder,
  //   private route: ActivatedRoute,
  //   private router: Router,
  //   private solicitudService: SolicitudService,
  //   private tokenService: TokenService
  // ) {}

  // ngOnInit(): void {
  //   this.detectarTipo();
  //   this.initForm();
  //   this.aplicarValidadoresPorTipo();
  // }

  // private detectarTipo(): void {
  //   const param = this.route.snapshot.queryParamMap.get('tipo');

  //   if (param === TipoSolicitudModel.ALTA_ARQUITECTO || param === TipoSolicitudModel.BAJA_ROL) {
  //     this.tipo = param as TipoSolicitudModel;
  //   } else {
  //     // fallback automático por rol
  //     this.tipo = this.tokenService.isArquitecto()
  //       ? TipoSolicitudModel.BAJA_ROL
  //       : TipoSolicitudModel.ALTA_ARQUITECTO;
  //   }
  // }

  // private initForm(): void {
  //   this.formulario = this.fb.group({
  //     // Alta
  //     matriculaArquitecto: [''],
  //     universidad: [''],
  //     anioRecibido: [''],

  //     // Baja
  //     motivo: ['']
  //   });
  // }

  // private aplicarValidadoresPorTipo(): void {
  //   const matriculaCtrl = this.formulario.get('matriculaArquitecto');
  //   const universidadCtrl = this.formulario.get('universidad');
  //   const anioCtrl = this.formulario.get('anioRecibido');
  //   const motivoCtrl = this.formulario.get('motivo');

  //   if (!matriculaCtrl || !universidadCtrl || !anioCtrl || !motivoCtrl) return;

  //   if (this.esAlta()) {
  //     // Alta: campos obligatorios
  //     matriculaCtrl.setValidators([Validators.required, Validators.maxLength(50)]);
  //     universidadCtrl.setValidators([Validators.required, Validators.maxLength(120)]);
  //     anioCtrl.setValidators([
  //       Validators.required,
  //       Validators.min(1900),
  //       Validators.max(new Date().getFullYear())
  //     ]);

  //     // Motivo NO obligatorio
  //     motivoCtrl.clearValidators();

  //   } else {
  //     // Baja: solo motivo obligatorio
  //     matriculaCtrl.clearValidators();
  //     universidadCtrl.clearValidators();
  //     anioCtrl.clearValidators();

  //     motivoCtrl.setValidators([Validators.required, Validators.maxLength(280)]);
  //   }

  //   matriculaCtrl.updateValueAndValidity();
  //   universidadCtrl.updateValueAndValidity();
  //   anioCtrl.updateValueAndValidity();
  //   motivoCtrl.updateValueAndValidity();
  // }

  // esAlta(): boolean {
  //   return this.tipo === TipoSolicitudModel.ALTA_ARQUITECTO;
  // }

  // // ==================== ARCHIVOS ====================

  // onFileChange(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files) return;

  //   this.archivos = Array.from(input.files);
  //   if (this.archivos.length > 0) {
  //     this.mostrarErrorArchivos = false;
  //   }
  // }

  // // ==================== MODAL ====================

  // private mostrarModal(
  //   titulo: string,
  //   mensaje: string,
  //   tipo: MessageType = 'info',
  //   redirigir: boolean = false
  // ): void {
  //   this.modalTitulo = titulo;
  //   this.modalMensaje = mensaje;
  //   this.modalTipo = tipo;
  //   this.modalVisible = true;
  //   this.redirigirDespues = redirigir;
  // }

  // onModalAceptar(): void {
  //   this.modalVisible = false;

  //   if (this.redirigirDespues) {
  //     this.router.navigate(['/solicitudes']);
  //   }

  //   this.redirigirDespues = false;
  // }

  // onModalCerrado(): void {
  //   this.modalVisible = false;
  //   this.redirigirDespues = false;
  // }

  // // ==================== ARCHIVOS ====================

  // onArchivosChange(files: File[]): void {
  //   this.archivos = files;
  //   if (this.archivos.length > 0) {
  //     this.mostrarErrorArchivos = false;
  //   }
  // }


  // // ==================== ENVIAR ====================

  // enviar(event?: Event): void {
  //   event?.preventDefault();

  //   this.cargando = true;

  //   if (this.esAlta()) {
  //     this.enviarAlta();
  //   } else {
  //     this.enviarBaja();
  //   }
  // }

  // private enviarAlta(): void {
  //   if (this.formulario.invalid) {
  //     this.formulario.markAllAsTouched();
  //     this.cargando = false;
  //     return;
  //   }

  //   if (!this.archivos.length) {
  //     this.mostrarErrorArchivos = true;
  //     this.cargando = false;
  //     return;
  //   }

  //   const dto: SolicitudNuevaModel = {
  //     tipo: TipoSolicitudModel.ALTA_ARQUITECTO,
  //     matriculaArquitecto: this.formulario.get('matriculaArquitecto')?.value,
  //     universidad: this.formulario.get('universidad')?.value,
  //     anioRecibido: this.formulario.get('anioRecibido')?.value
  //   };

  //   this.solicitudService.nuevaSolicitud(dto, this.archivos).subscribe({
  //     next: () => {
  //       this.cargando = false;
  //       this.formulario.reset();
  //       this.archivos = [];
  //       this.mostrarErrorArchivos = false;

  //       this.mostrarModal(
  //         'Solicitud enviada',
  //         'Tu solicitud para ser arquitecto fue enviada correctamente.',
  //         'success',
  //         true
  //       );
  //     },
  //     error: (e) => {
  //       console.error(e);
  //       this.cargando = false;

  //       const msg =
  //         e?.error?.mensaje ||
  //         e?.error?.message ||
  //         'No se pudo enviar la solicitud.';

  //       this.mostrarModal(
  //         'Error al enviar',
  //         msg,
  //         'error'
  //       );
  //     }
  //   });
  // }

  // private enviarBaja(): void {
  //   if (this.formulario.invalid) {
  //     this.formulario.markAllAsTouched();
  //     this.cargando = false;
  //     return;
  //   }

  //   const dto: SolicitudNuevaModel = {
  //     tipo: TipoSolicitudModel.BAJA_ROL,
  //     rolAEliminar: RolesEnum.ROLE_ARQUITECTO,
  //     motivo: this.formulario.get('motivo')?.value
  //   };

  //   this.solicitudService.nuevaSolicitud(dto).subscribe({
  //     next: () => {
  //       this.cargando = false;
  //       this.formulario.reset();

  //       this.mostrarModal(
  //         'Solicitud enviada',
  //         'Tu solicitud de baja como arquitecto fue enviada correctamente.',
  //         'success',
  //         true
  //       );
  //     },
  //     error: (e) => {
  //       console.error(e);
  //       this.cargando = false;

  //       const msg =
  //         e?.error?.mensaje ||
  //         e?.error?.message ||
  //         'No se pudo enviar la solicitud.';

  //       this.mostrarModal(
  //         'Error al enviar',
  //         msg,
  //         'error'
  //       );
  //     }
  //   });
  // }

  // volver(): void {
  //   this.router.navigate(['/solicitudes']);
  // }


