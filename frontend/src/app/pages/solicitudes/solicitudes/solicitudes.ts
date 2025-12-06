import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { SolicitudService } from '../../../services/solicitudService/solicitud-service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { EstadoSolicitudModel } from '../../../models/solicitudModels/estadoSolicitudModel';
import { SolicitudResponseModel } from '../../../models/solicitudModels/solicitudResponseModel';
import { TipoSolicitudModel } from '../../../models/solicitudModels/tipoSolicitudModel';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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
        undefined,                     
        undefined,                     
        f.fechaDesde || undefined,
        f.fechaHasta || undefined,
        undefined                      
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

  // =================== NUEVA SOLICITUD (botón +) ===================

  puedeCrearSolicitud(): boolean {
    const esArq = this.tokenService.isArquitecto();

    const tieneAltaPendiente = this.solicitudes.some(s =>
      s.tipoSolicitud === TipoSolicitudModel.ALTA_ARQUITECTO &&
      (s.estado === EstadoSolicitudModel.PENDIENTE || s.estado === EstadoSolicitudModel.EN_PROCESO)
    );

    const tieneBajaPendiente = this.solicitudes.some(s =>
      s.tipoSolicitud === TipoSolicitudModel.BAJA_ROL &&
      (s.estado === EstadoSolicitudModel.PENDIENTE || s.estado === EstadoSolicitudModel.EN_PROCESO)
    );

    if (!esArq) {
      // No es arquitecto -> solo puede pedir ALTA si no tiene alta pendiente
      return !tieneAltaPendiente;
    }

    // Es arquitecto -> solo puede pedir BAJA si no tiene baja pendiente
    return !tieneBajaPendiente;
  }

  irANuevaSolicitud(): void {
    if (!this.puedeCrearSolicitud()) return;
    const tipo = this.tokenService.isArquitecto()
      ? TipoSolicitudModel.BAJA_ROL
      : TipoSolicitudModel.ALTA_ARQUITECTO;

    this.router.navigate(['/formSolicitudes'], {
      queryParams: { tipo }
    });
  }

  // =================== DETALLE ===================

  verDetalle(s: SolicitudResponseModel): void {
    if (!s.id) { return; }
    this.router.navigate(['/solicitudes', s.id]);
  }

}
