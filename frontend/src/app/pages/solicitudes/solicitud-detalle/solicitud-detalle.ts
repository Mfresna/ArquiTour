import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitudResponseModel } from '../../../models/solicitudModels/solicitudResponseModel';
import { TipoSolicitudDescripcion, TipoSolicitudModel } from '../../../models/solicitudModels/tipoSolicitudModel';
import { SolicitudService } from '../../../services/solicitudService/solicitud-service';
import { CommonModule } from '@angular/common';
import { SolicitudResolucionModel } from '../../../models/solicitudModels/solicitudResolucionModel';
import { EstadoSolicitudDescripcion, EstadoSolicitudModel } from '../../../models/solicitudModels/estadoSolicitudModel';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';
import { RolDescripcion, RolesEnum } from '../../../models/usuarioModels/rolEnum';
import { environment } from '../../../../environments/environment';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-solicitud-detalle',
  imports: [CommonModule, ReactiveFormsModule, MensajeModal],
  templateUrl: './solicitud-detalle.html',
  styleUrl: './solicitud-detalle.css',
})

export class SolicitudDetalle implements OnInit, OnDestroy {

  solicitud!: SolicitudResponseModel;
  EstadoSolicitudModel = EstadoSolicitudModel;
  TipoSolicitudModel   = TipoSolicitudModel;
  TipoSolicitudDescripcion = TipoSolicitudDescripcion;
  EstadoSolicitudDescripcion = EstadoSolicitudDescripcion;
  RolDescripcion = RolDescripcion;

  redirigirAlCerrarModal = false;

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
    this.formResolucion = this.fb.group({
      aprobada: [true, Validators.required],
      comentario: ['', [Validators.maxLength(560)]],
    });

    this.validadorMotivo();

    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!id) {
        this.router.navigate(['/solicitudes']);
        return;
      }      
      this.cargarUsuarioYSolicitud(id);
    });

  }

  ngOnDestroy(): void {
    this.dejar();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent) {
    this.dejar();
  }


  private cargarUsuarioYSolicitud(id: number): void {
    this.usuarioService.getUsuarioMe().subscribe({
      next: (u) => {
        this.usuarioActualId = u.id ?? null;

        this.esAdminActual = Array.isArray(u.roles)
          ? u.roles.includes(RolesEnum.ROLE_ADMINISTRADOR)
          : false;

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

        this.tomar();

      },
      error: () => {
        this.cargando = false;
        this.router.navigate(['/solicitudes']);
      }
    });
  }
  // ========= reglas de visibilidad =========
  get esSolicitudPropia(): boolean {
    if (!this.solicitud || this.usuarioActualId == null) return false;

    // ajustá este campo si en tu modelo se llama distinto
    const idSolicitante =
      (this.solicitud as any).idUsuario ??
      this.solicitud.idUsuario
      null;

    return idSolicitante === this.usuarioActualId;
  }


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

  // tomar(): void {
  //   if (!this.solicitud?.id) return;

  //   this.cargando = true;
  //   this.solicitudService.tomarSolicitud(this.solicitud.id).subscribe({
  //     next: (s) => {
  //       this.solicitud = s;
  //       this.cargando = false;
  //       this.mostrarModal(
  //         'Solicitud asignada',
  //         'La solicitud ahora está a tu cargo.',
  //         'success'
  //       );
  //     },
  //     error: (e) => {
  //       this.cargando = false;
  //       const msg = e?.error?.mensaje || 'No se pudo tomar la solicitud.';
  //       this.mostrarModal('Error', msg, 'error');
  //     }
  //   });
  // }

  dejar():void {
    if(this.esAdminActual && 
      (this.solicitud.estado === this.EstadoSolicitudModel.PENDIENTE ||
      this.solicitud.estado === this.EstadoSolicitudModel.EN_PROCESO)){
        this.solicitudService.dejarSolicitudConFetch(this.solicitud.id);
      }
  }

  tomar(): void {
    if (!this.solicitud?.id) return;

    if(this.puedeTomar() && this.puedeGestionar()){
      this.cargando = true;

      this.solicitudService.tomarSolicitud(this.solicitud.id).subscribe({
        next: (s) => {
          this.solicitud = s;
          this.cargando = false;
        },
        error: (e) => {
          this.cargando = false;
        }

      });
    }
    
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
        this.redirigirAlCerrarModal = true;
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

  get mostrarFlechasDocs(): boolean {
  // mismo criterio que en ObraDetalle: ajustá el número si allá usás otro
  return this.docSrc().length > 3;
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
     if (this.redirigirAlCerrarModal) {
      this.redirigirAlCerrarModal = false;   
      this.router.navigate(['/solicitudes']);
    }
  }

  onModalCerrado(): void {
    this.modalVisible = false;
      if (this.redirigirAlCerrarModal) {
        this.redirigirAlCerrarModal = false;
        this.router.navigate(['/solicitudes']);
      }
  }

  volver(): void {
    this.router.navigate(['/solicitudes']);
  }

  //=================== VALIDADORES

  private validadorMotivo(): void {
    const aprobadaCtrl   = this.formResolucion.get('aprobada');
    const comentarioCtrl = this.formResolucion.get('comentario');

    if (!aprobadaCtrl || !comentarioCtrl) return;

    const aplicarValidadores = (valor: boolean) => {
      if (valor === false) {
        // RECHAZAR → comentario requerido
        comentarioCtrl.setValidators([
          Validators.required,
          Validators.maxLength(560),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\-_\!¡&\s\.,¿?]+$/),
        ]);
      } else {
        // APROBAR → comentario opcional
        comentarioCtrl.setValidators([
          Validators.maxLength(560),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\-_\!¡&\s\.,¿?]+$/),
        ]);
      }
      comentarioCtrl.updateValueAndValidity({ emitEvent: false });
    };

    // Aplicar al valor inicial
    aplicarValidadores(aprobadaCtrl.value);

    // Escuchar cambios
    aprobadaCtrl.valueChanges.subscribe((valor) => {
      comentarioCtrl.markAsUntouched();
      comentarioCtrl.markAsPristine();

      aplicarValidadores(valor);
    });
  }

  
}
