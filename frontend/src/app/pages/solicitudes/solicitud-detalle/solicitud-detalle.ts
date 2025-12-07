import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudResponseModel } from '../../../models/solicitudModels/solicitudResponseModel';
import { TipoSolicitudModel } from '../../../models/solicitudModels/tipoSolicitudModel';
import { SolicitudService } from '../../../services/solicitudService/solicitud-service';
import { CommonModule } from '@angular/common';
import { SolicitudResolucionModel } from '../../../models/solicitudModels/solicitudResolucionModel';
import { EstadoSolicitudModel } from '../../../models/solicitudModels/estadoSolicitudModel';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { RolesEnum } from '../../../models/usuarioModels/rolEnum';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-solicitud-detalle',
  imports: [CommonModule, ReactiveFormsModule, MensajeModal],
  templateUrl: './solicitud-detalle.html',
  styleUrl: './solicitud-detalle.css',
})
export class SolicitudDetalle implements OnInit {

  solicitud!: SolicitudResponseModel;
  EstadoSolicitudModel = EstadoSolicitudModel;
  TipoSolicitudModel   = TipoSolicitudModel;

  cargando = false;

  formResolucion!: FormGroup;

  // ==== info usuario actual (desde /me) ====
  usuarioActualId: number | null = null;
  esAdminActual = false;

  // ==== galería documentación ====
  @ViewChild('carruselDocs') carruselDocs!: ElementRef<HTMLDivElement>;
  ventanaDocsAbierta = false;
  docSeleccionado = 0;
  docDefecto = `${environment.imgObra}`;

  // ===== MODAL =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudService: SolicitudService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (!id) {
      this.router.navigate(['/solicitudes']);
      return;
    }

    this.formResolucion = this.fb.group({
      aprobada: [true, Validators.required],
      comentario: ['', [Validators.maxLength(280)]],
    });

    // 1) usuario actual desde /me
    this.usuarioService.getUsuarioMe().subscribe({
      next: (u) => {
        this.usuarioActualId = u.id ?? null;

        this.esAdminActual = Array.isArray(u.roles)
          ? u.roles.includes(RolesEnum.ROLE_ADMINISTRADOR)
          : false;

        // 2) cargo la solicitud
        this.cargarSolicitud(id);
      },
      error: () => {
        this.usuarioActualId = null;
        this.esAdminActual = false;
        this.cargarSolicitud(id);
      }
    });
  }

  private cargarSolicitud(id: number): void {
    this.cargando = true;
    this.solicitudService.getSolicitud(id).subscribe({
      next: (s) => {
        this.solicitud = s;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.router.navigate(['/solicitudes']);
      }
    });
  }

  // ========= reglas de visibilidad =========

  puedeTomar(): boolean {
    if (!this.solicitud || !this.esAdminActual) return false;

    return (
      this.solicitud.estado === this.EstadoSolicitudModel.PENDIENTE &&
      !this.solicitud.adminAsignado
    );
  }

  puedeResolver(): boolean {
    if (!this.solicitud || !this.esAdminActual) return false;
    return this.solicitud.estado === this.EstadoSolicitudModel.EN_PROCESO;
  }

  puedeGestionar(): boolean {
    if (!this.solicitud || !this.esAdminActual) return false;

    return (
      this.solicitud.estado === this.EstadoSolicitudModel.PENDIENTE ||
      this.solicitud.estado === this.EstadoSolicitudModel.EN_PROCESO
    );
  }


  // ========= acciones =========

  tomar(): void {
    if (!this.solicitud?.id) return;

    this.cargando = true;
    this.solicitudService.tomarSolicitud(this.solicitud.id).subscribe({
      next: (s) => {
        this.solicitud = s;
        this.cargando = false;
        this.mostrarModal(
          'Solicitud asignada',
          'La solicitud ahora está a tu cargo.',
          'success'
        );
      },
      error: (e) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudo tomar la solicitud.';
        this.mostrarModal('Error', msg, 'error');
      }
    });
  }

  resolver(): void {
    if (!this.solicitud?.id || this.formResolucion.invalid) {
      this.formResolucion.markAllAsTouched();
      return;
    }

    const body: SolicitudResolucionModel = {
      aceptar: this.formResolucion.value.aprobada,
      comentarioAdmin: this.formResolucion.value.comentario || null
    };

    this.cargando = true;
    this.solicitudService.resolverSolicitud(this.solicitud.id, body).subscribe({
      next: (s) => {
        this.solicitud = s;
        this.cargando = false;
        this.mostrarModal(
          'Solicitud resuelta',
          'La solicitud fue resuelta correctamente.',
          'success'
        );
      },
      error: (e) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudo resolver la solicitud.';
        this.mostrarModal('Error', msg, 'error');
      }
    });
  }

  // ========= galería documentación =========

  docSrc(): string[] {
    const urls = this.solicitud?.urlsImagenes ?? [];
    if (!urls.length) return [];

    return urls.map(u => {
      const path = u.startsWith('/') ? u : `/${u}`;
      return `${environment.apiUrl}${path}`;
    });
  }

  scrollDocs(direccion: number): void {
  if (!this.carruselDocs) return;

  const cont = this.carruselDocs.nativeElement;
  const ancho = cont.clientWidth || 300;

  cont.scrollBy({
    left: direccion * (ancho * 0.7),
    behavior: 'smooth'
  });
}

abrirDoc(index: number): void {
  if (!this.docSrc().length) return;
  this.docSeleccionado = index;
  this.ventanaDocsAbierta = true;
}

cerrarVentanaDocs(): void {
  this.ventanaDocsAbierta = false;
}

moverDoc(delta: number): void {
  const total = this.docSrc().length;
  if (!total) return;

  let nuevo = this.docSeleccionado + delta;
  if (nuevo < 0) nuevo = total - 1;
  if (nuevo >= total) nuevo = 0;

  this.docSeleccionado = nuevo;
}

get docActualUrl(): string | null {
  const docs = this.docSrc();
  if (!docs.length) return null;
  return docs[this.docSeleccionado] ?? null;
}

docError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (img.src.includes(this.docDefecto)) return; 
  img.onerror = null;       
  img.src = this.docDefecto;
}

  // ========= modal & navegación =========

  private mostrarModal(titulo: string, mensaje: string, tipo: MessageType): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;
  }

  onModalAceptar(): void {
    this.modalVisible = false;
  }

  onModalCerrado(): void {
    this.modalVisible = false;
  }

  volver(): void {
    this.router.navigate(['/solicitudes']);
  }
}
