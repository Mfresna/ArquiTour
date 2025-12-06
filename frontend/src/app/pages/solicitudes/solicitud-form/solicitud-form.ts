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
  tipo!: TipoSolicitudModel;            // ALTA_ARQUITECTO o BAJA_ROL
  TipoSolicitudModel = TipoSolicitudModel;

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
    this.detectarTipo();
    this.initForm();
    this.aplicarValidadoresPorTipo();
  }

  private detectarTipo(): void {
    const param = this.route.snapshot.queryParamMap.get('tipo');

    if (param === TipoSolicitudModel.ALTA_ARQUITECTO || param === TipoSolicitudModel.BAJA_ROL) {
      this.tipo = param as TipoSolicitudModel;
    } else {
      // fallback automático por rol
      this.tipo = this.tokenService.isArquitecto()
        ? TipoSolicitudModel.BAJA_ROL
        : TipoSolicitudModel.ALTA_ARQUITECTO;
    }
  }

  private initForm(): void {
    this.formulario = this.fb.group({
      // Alta
      matriculaArquitecto: [''],
      universidad: [''],
      anioRecibido: [''],

      // Baja
      motivo: ['']
    });
  }

  private aplicarValidadoresPorTipo(): void {
    const matriculaCtrl = this.formulario.get('matriculaArquitecto');
    const universidadCtrl = this.formulario.get('universidad');
    const anioCtrl = this.formulario.get('anioRecibido');
    const motivoCtrl = this.formulario.get('motivo');

    if (!matriculaCtrl || !universidadCtrl || !anioCtrl || !motivoCtrl) return;

    if (this.esAlta()) {
      // Alta: campos obligatorios
      matriculaCtrl.setValidators([Validators.required, Validators.maxLength(50)]);
      universidadCtrl.setValidators([Validators.required, Validators.maxLength(120)]);
      anioCtrl.setValidators([
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear())
      ]);

      // Motivo NO obligatorio
      motivoCtrl.clearValidators();

    } else {
      // Baja: solo motivo obligatorio
      matriculaCtrl.clearValidators();
      universidadCtrl.clearValidators();
      anioCtrl.clearValidators();

      motivoCtrl.setValidators([Validators.required, Validators.maxLength(280)]);
    }

    matriculaCtrl.updateValueAndValidity();
    universidadCtrl.updateValueAndValidity();
    anioCtrl.updateValueAndValidity();
    motivoCtrl.updateValueAndValidity();
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

  // ==================== ARCHIVOS ====================

  onArchivosChange(files: File[]): void {
    this.archivos = files;
    if (this.archivos.length > 0) {
      this.mostrarErrorArchivos = false;
    }
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

    const dto: SolicitudNuevaModel = {
      tipo: TipoSolicitudModel.BAJA_ROL,
      rolAEliminar: RolesEnum.ROLE_ARQUITECTO,
      motivo: this.formulario.get('motivo')?.value
    };

    this.solicitudService.nuevaSolicitud(dto).subscribe({
      next: () => {
        this.cargando = false;
        this.formulario.reset();

        this.mostrarModal(
          'Solicitud enviada',
          'Tu solicitud de baja como arquitecto fue enviada correctamente.',
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
