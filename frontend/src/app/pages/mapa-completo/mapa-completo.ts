import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as L from 'leaflet';
import { ObraService } from '../../services/obraService/obra-service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs/operators';
import { ObraModel } from '../../models/obraModels/obraModel';

@Component({
  selector: 'app-mapa-completo',
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-completo.html',
  styleUrl: './mapa-completo.css',
})
export class MapaCompleto implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;
  private markerObras = new Map<number, L.Marker>();

  obras: ObraModel[] = [];
  obraSeleccionada!: ObraModel
  cargando = false;
  error?: string;

  constructor(
    private obraService: ObraService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.inicializarMapa();
    this.cargarTodasLasObras();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  // =================== MAPA ===================

  private inicializarMapa(): void {
    this.map = L.map('mapa-obras', {
      center: [0, 0],
      zoom: 3,
      minZoom: 3
    });

    // Podés cambiar esto a tu environment.templateMapa si querés
    L.tileLayer(`${environment.templateMapa}`, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  // =================== DATOS ===================

  private cargarTodasLasObras(): void {
    this.cargando = true;
    this.error = undefined;

    // sin filtros → devuelve todas las obras
    this.obraService.getFiltrarObras()
      .subscribe({
        next: obras => {
          this.obras = obras;
          this.cargando = false;
          this.dibujarMarcadores();
        },
        error: err => {
          console.error(err);
          this.cargando = false;
          this.error = 'No se pudieron cargar las obras.';
        }
      });
  }

  // =================== MARCADORES ===================

  private dibujarMarcadores(): void {
    this.markersLayer.clearLayers();
    this.markerObras.clear();

    const puntos: L.LatLngTuple[] = [];

    this.obras
      .filter(o => o.latitud != null && o.longitud != null)
      .forEach(obra => {
        const lat = obra.latitud!;
        const lon = obra.longitud!;

        const marker = L.marker([lat, lon], {
          icon: L.icon({
            iconUrl: `${environment.iconoMapaPrincipal}`,
            iconSize: [32, 42],
            iconAnchor: [16, 42]
          })
        });

        marker
          .addTo(this.markersLayer)

        marker.on('click', () => {
          this.centrarEnObra(obra);
          this.obraSeleccionada = obra;
        });


        if (obra.id != null) {
          this.markerObras.set(obra.id, marker);
        }

        puntos.push([lat, lon]);
      });

    // Ajustar el mapa para que entren todas las obras
    if (puntos.length) {
      const bounds = L.latLngBounds(puntos);
      this.map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16
      });
    }
  }

  // =================== INTERACCIÓN ===================

  irADetalleObra(obra: ObraModel): void {
    if (!obra.id) return;
    this.router.navigate(['/obras', obra.id]); // ajustá la ruta si es distinta
  }

  centrarEnObra(obra: ObraModel): void {
    if (!obra.latitud || !obra.longitud) return;

    const marker = obra.id != null ? this.markerObras.get(obra.id) : undefined;

    if (marker) {
      const latLng = marker.getLatLng();
      this.map.setView(latLng, 18, { animate: true });
      marker.openPopup();
    } else {
      this.map.setView([obra.latitud, obra.longitud], 18, { animate: true });
    }
  }
}
