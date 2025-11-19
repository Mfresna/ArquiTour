import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import * as L from 'leaflet';
import { ObraMapaModel } from '../../models/mapaModels/obraMapaModel';
import { CategoriaObraDescripcion, CategoriaObraModel } from '../../models/obraModels/categoriaObraModel';
import { EstadoObraDescripcion, EstadoObraModel } from '../../models/obraModels/estadoObraModel';
import { ObraService } from '../../services/obraService/obra-service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-mapa-principal',
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-principal.html',
  styleUrl: './mapa-principal.css',
})
export class MapaPrincipal implements AfterViewInit, OnDestroy {

  private zoomInicial:number = 12;

  private map!: L.Map;
  private markersLayer!: L.LayerGroup;

  obras: ObraMapaModel[] = [];
  obrasFiltradas: ObraMapaModel[] = [];

  //Datos default
  distanciaKm = 25;
  cargando = false;

  error?: string;

  // filtros para el form
  estadoFiltro: string = '';
  categoriaFiltro: string = '';

  categoriaObraDescripcion = CategoriaObraDescripcion;
  estadoObraDescripcion    = EstadoObraDescripcion;

  estadosDisponibles: EstadoObraModel[] = Object.values(EstadoObraModel);
  categoriasDisponibles: CategoriaObraModel[] = Object.values(CategoriaObraModel);

  constructor(
    private obraService: ObraService,
    private router: Router
  ) {}

  //DESPUES DE INICIALIZARSE
  async ngAfterViewInit(): Promise<void> {

    this.inicializarMapa();

    const ubicacion = await this.obtenerUbicacionDelUsuario();

    //Si son nulas las obtiene de la IP si puede
    const coordsBack = ubicacion ? { latitud: ubicacion.lat, longitud: ubicacion.lon } : undefined;

    if (ubicacion) {
      this.map.setView([ubicacion.lat, ubicacion.lon], this.zoomInicial);

      L.marker([ubicacion.lat, ubicacion.lon], {

          icon: L.icon({
            iconUrl: `${environment.iconoMapaPrincipal}`,
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

    //Sete la informacion contextual atribution es el copyright de abajo a la derecha
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  //OBTIENE LA UBICACION A PARTIR DEL NAVEGADOR CON HIG ACCURANCY (mayor precision)
  private obtenerUbicacionDelUsuario(): Promise<{ lat: number, lon: number } | null> {

    return new Promise(resolve => {
      if (!navigator.geolocation) {
        console.warn('Geolocalización no soportada por el navegador.');
        return resolve(null);
      }

      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        }),

        err => {
          console.warn('No se pudo obtener la ubicación:', err.message);
          resolve(null);
        },

        {
          timeout: 5000,
          enableHighAccuracy: true,
          maximumAge: 0
        }
      );
    });
  }

  //RECUPERA LAS OBRAS CERCANAS 
  private cargarObrasCercanas(coordsBack?: { latitud: number; longitud: number }): void {
    this.cargando = true;
    this.error = undefined;

    this.obraService.getObrasCercanas(this.distanciaKm, coordsBack)
      .pipe(
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: obras => {
          this.obras = obras;
          this.aplicarFiltros();
          this.dibujarMarcadores(coordsBack ?? null);
        },
        error: err => {
          console.error(err);
          this.error = 'No se pudieron cargar las obras cercanas.';
        }
      });
  }

//========================================= FORMULARIO FILTRO

  //el usr modifica los filtros
  onCambioFiltros(): void {
    this.aplicarFiltros();
    this.dibujarMarcadores(null);
  }

  onDistanciaChange(valor: string | number): void {

    const num = typeof valor === 'string' ? Number(valor) : valor;

    if (!isNaN(num)) {
      this.distanciaKm = num;
      this.cargarObrasCercanas();
    }
  }

  aplicarFiltros(): void {
    this.obrasFiltradas = this.obras.filter(o => {

      const coincideEstado = this.estadoFiltro ? o.estado === this.estadoFiltro : true;
      const coincideCategoria = this.categoriaFiltro ? o.categoria === this.categoriaFiltro : true;

      return coincideEstado && coincideCategoria;
    });
  }

  // ============================================DIBUJAR OBRAS EN EL MAPA


    //   private dibujarMarcadores(coordsBack: { latitud: number; longitud: number } | null): void {
    //     this.markersLayer.clearLayers();

    //     if (coordsBack) {
    //       L.marker([coordsBack.latitud, coordsBack.longitud], {
    //         icon: L.icon({
    //           iconUrl: `${environment.iconoMapaPrincipalUsuario}`,
    //           iconSize: [28, 28],
    //           iconAnchor: [14, 14]
    //         })
    //       }).addTo(this.markersLayer)
    //         .bindPopup('Su arquitour cominza aca');
    //     }

    //     // marcadores de obras FILTRADAS
    //     this.obrasFiltradas.forEach(obra => {
    //       if (obra.latitud != null && obra.longitud != null) {
    //         const marker = L.marker([obra.latitud, obra.longitud]);

    //         marker
    //           .addTo(this.markersLayer)
    //           .bindPopup(`<strong>${obra.nombre}</strong>`);

    //         marker.on('click', () => {
    //           this.router.navigate(['/obras', obra.id]); // ajustá ruta si hace falta
    //         });
    //       }
    //     });

    //     // Ajustar mapa a todo
    //     const bounds = L.latLngBounds([]);

    //     if (coordsBack) {
    //       bounds.extend([coordsBack.latitud, coordsBack.longitud]);
    //     }

    //     this.obrasFiltradas.forEach(o => {
    //       if (o.latitud != null && o.longitud != null) {
    //         bounds.extend([o.latitud, o.longitud]);
    //       }
    //     });

    //     if (bounds.isValid()) {
    //       this.map.fitBounds(bounds, { padding: [40, 40] });
    //     }
    //   }


  private dibujarMarcadores(coordsBack: { latitud: number; longitud: number } | null): void {
    this.markersLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    if (coordsBack) {
      L.marker([coordsBack.latitud, coordsBack.longitud], {
        icon: L.icon({
          iconUrl: `${environment.iconoMapaPrincipalUsuario}`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      })
        .addTo(this.markersLayer)
        .bindPopup('Su ArquiTour comienza acá');

      bounds.extend([coordsBack.latitud, coordsBack.longitud]);
    }

    this.obrasFiltradas
      ?.filter(o => o.latitud != null && o.longitud != null)
      .forEach(obra => {
        const marker = L.marker([obra.latitud!, obra.longitud!]);

        marker
          .addTo(this.markersLayer)
          .bindPopup(`<strong>${obra.nombre}</strong>`);

        marker.on('click', () => {
          this.router.navigate(['/obras', obra.id]);
        });

        bounds.extend([obra.latitud!, obra.longitud!]);
      });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16
      });
    }
  }


  irAobra(o: ObraMapaModel){
    this.router.navigate(['/obras', o.id])
  }
  
}
