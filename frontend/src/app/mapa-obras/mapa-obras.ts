import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { ObraMapaModel } from '../models/obraMapaModels/obraMapaModels';
import { ObraService } from '../services/obraService/obra-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mapa-obras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-obras.html',
  styleUrl: './mapa-obras.css',
})
export class MapaObras implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;

  obras: ObraMapaModel[] = [];
  obrasFiltradas: ObraMapaModel[] = [];  // 👈 lo que realmente mostramos

  distanciaKm = 25;        // radio por defecto
  cargando = false;
  error?: string;

  // filtros
  estadoFiltro: string = '';
  categoriaFiltro: string = '';

  // TODO: ajustá estos arrays a tus enums reales
  estadosDisponibles: string[] = [
    'FINALIZADA',
    'EN_OBRA',
    'PROYECTO'
  ];

  categoriasDisponibles: string[] = [
    'VIVIENDA_UNIFAMILIAR',
    'VIVIENDA_COLECTIVA',
    'EDIFICIO_PUBLICO'
  ];

  constructor(
    private obraService: ObraService,
    public router: Router
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.inicializarMapa();

    const ubicacion = await this.obtenerUbicacionDelUsuario();

    const coordsBack = ubicacion
      ? { latitud: ubicacion.lat, longitud: ubicacion.lon }
      : undefined; // 👈 importante para typescript

    if (ubicacion) {
      this.map.setView([ubicacion.lat, ubicacion.lon], 14);

      L.marker([ubicacion.lat, ubicacion.lon], {
        icon: L.icon({
          iconUrl: 'assets/icons/marker-user.svg',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(this.map)
        .bindPopup('Estás aquí')
        .openPopup();
    } else {
      console.warn('No se pudo obtener ubicación, se usará IP en el backend.');
    }

    this.cargarObrasCercanas(coordsBack);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private inicializarMapa(): void {
    this.map = L.map('mapa-obras', {
      center: [0, 0],
      zoom: 2
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  // =====================
  // GEO NAVEGADOR
  // =====================

  private obtenerUbicacionDelUsuario(): Promise<{ lat: number, lon: number } | null> {
    return new Promise(resolve => {
      if (!('geolocation' in navigator)) {
        return resolve(null);
      }

      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  // =====================
  // OBRAS CERCANAS + FILTROS
  // =====================

  private cargarObrasCercanas(coordsBack?: { latitud: number; longitud: number }): void {
    this.cargando = true;
    this.error = undefined;

    this.obraService.getObrasCercanas(this.distanciaKm, coordsBack)
      .subscribe({
        next: obras => {
          this.obras = obras;
          this.aplicarFiltros();           // 👈 llena obrasFiltradas
          this.cargando = false;
          this.dibujarMarcadores(coordsBack ?? null);
        },
        error: err => {
          console.error(err);
          this.cargando = false;
          this.error = 'No se pudieron cargar las obras cercanas.';
        }
      });
  }

  // Se llama cada vez que cambia algún filtro
  aplicarFiltros(): void {
    this.obrasFiltradas = this.obras.filter(o => {
      const coincideEstado = this.estadoFiltro
        ? o.estado === this.estadoFiltro
        : true;

      const coincideCategoria = this.categoriaFiltro
        ? o.categoria === this.categoriaFiltro
        : true;

      return coincideEstado && coincideCategoria;
    });
  }

  // Cuando cambian filtros desde el template
  onCambioFiltros(): void {
    this.aplicarFiltros();
    this.dibujarMarcadores(null); // no movemos el mapa por coords de usuario acá
  }

  // Cuando cambia la distancia (ej: slider o select)
onDistanciaChange(event: Event) {
  const valor = Number((event.target as HTMLInputElement).value);
  this.distanciaKm = valor;
  this.cargarObrasCercanas();
}

  private dibujarMarcadores(coordsBack: { latitud: number; longitud: number } | null): void {
    this.markersLayer.clearLayers();

    // marcador del usuario
    if (coordsBack) {
      L.marker([coordsBack.latitud, coordsBack.longitud], {
        icon: L.icon({
          iconUrl: 'assets/icons/marker-user.svg',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(this.markersLayer)
        .bindPopup('Estás aquí');
    }

    // marcadores de obras FILTRADAS
    this.obrasFiltradas.forEach(obra => {
      if (obra.latitud != null && obra.longitud != null) {
        const marker = L.marker([obra.latitud, obra.longitud]);

        marker
          .addTo(this.markersLayer)
          .bindPopup(`<strong>${obra.nombre}</strong>`);

        marker.on('click', () => {
          this.router.navigate(['/obras', obra.id]); // ajustá ruta si hace falta
        });
      }
    });

    // Ajustar mapa a todo
    const bounds = L.latLngBounds([]);

    if (coordsBack) {
      bounds.extend([coordsBack.latitud, coordsBack.longitud]);
    }

    this.obrasFiltradas.forEach(o => {
      if (o.latitud != null && o.longitud != null) {
        bounds.extend([o.latitud, o.longitud]);
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }
}
