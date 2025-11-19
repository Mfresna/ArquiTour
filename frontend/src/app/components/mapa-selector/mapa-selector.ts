import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import L from 'leaflet';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mapa-selector',
  imports: [CommonModule],
  templateUrl: './mapa-selector.html',
  styleUrl: './mapa-selector.css',
})

export class MapaSelector implements AfterViewInit, OnChanges, OnDestroy {

  /** Coordenadas iniciales (por ejemplo para editar una obra existente).
   *  Si vienen null/undefined, se usa el centro por defecto.
   */
  @Input() latitud: number | null | undefined;
  @Input() longitud: number | null | undefined;

  /** Zoom inicial (si viene algo raro, se fuerza a un valor razonable) */
  @Input() zoom: number = 14;

  /** Emite cada vez que el usuario hace click en el mapa */
  @Output() coordenadasSeleccionadas = new EventEmitter<{
    latitud: number;
    longitud: number;
  }>();

  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;

  // Centro por defecto (Mar del Plata en tu caso)
  private readonly defaultLat = -38.0055;
  private readonly defaultLon = -57.5426;

  ngAfterViewInit(): void {
    this.crearMapa();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // No hacer nada hasta que el mapa exista
    if (!this.map) return;

    if (changes['latitud'] || changes['longitud'] || changes['zoom']) {
      this.actualizarVista();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  /** Crea el mapa una sola vez */
  private crearMapa(): void {
    const center = this.obtenerCentroInicial();
    const zoom = this.obtenerZoomValido(this.zoom);

    this.map = L.map(this.mapContainer.nativeElement, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer(environment.templateMapa, {
      maxZoom: 19,
    }).addTo(this.map);

    // Pin inicial SIEMPRE en el centro (sea default o coords de la obra)
    this.colocarOMoverMarcador(center[0], center[1]);

    // Click del usuario → mover pin y emitir coords
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.colocarOMoverMarcador(lat, lng);

      this.coordenadasSeleccionadas.emit({
        latitud: lat,
        longitud: lng,
      });
    });
  }

  /** Actualiza la vista cuando cambian @Input() (por ejemplo al editar) */
  private actualizarVista(): void {
    if (!this.map) return;

    const center = this.obtenerCentroInicial();
    const zoom = this.obtenerZoomValido(this.zoom);

    this.map.setView(center, zoom);
    this.colocarOMoverMarcador(center[0], center[1]);
  }

  /** Devuelve el centro a usar: o las coords de la obra o las por defecto */
  private obtenerCentroInicial(): [number, number] {
    const lat = (this.latitud ?? this.defaultLat);
    const lon = (this.longitud ?? this.defaultLon);
    return [lat, lon];
  }

  /** Se asegura de que el zoom sea un número razonable */
  private obtenerZoomValido(zoom: number | null | undefined): number {
    const z = Number(zoom);
    if (!Number.isFinite(z)) return 14;      // valor por defecto
    return Math.min(Math.max(z, 2), 19);     // entre 2 y 19
  }

  private colocarOMoverMarcador(lat: number, lon: number): void {
    const position: L.LatLngExpression = [lat, lon];

    if (this.marker) {
      this.marker.setLatLng(position);
    } else {
      this.marker = L.marker(position, {
        icon: L.icon({
          iconUrl: environment.iconoMapaPrincipal,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -30],
        }),
      }).addTo(this.map!);
    }
  }
}



























// export class MapaSelector implements AfterViewInit, OnChanges, OnDestroy
// {
//   /** Coordenadas iniciales (por ejemplo para editar una obra existente) */
//   @Input() latitud: number | null | undefined;
//   @Input() longitud: number | null | undefined;

//   /** Zoom inicial */
//   @Input() zoom: number = 8;

//   /** Emite cada vez que el usuario hace click en el mapa */
//   @Output() coordenadasSeleccionadas = new EventEmitter<{
//     latitud: number;
//     longitud: number;
//   }>();

//   @ViewChild('mapContainer', { static: true })
//   mapContainer!: ElementRef<HTMLDivElement>;

//   private map?: L.Map;
//   private marker?: L.Marker;

//   ngAfterViewInit(): void {
//     this.initOrUpdateMap();
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['latitud'] || changes['longitud']) {
//       this.initOrUpdateMap();
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.map) {
//       this.map.remove();
//     }
//   }

//   private initOrUpdateMap(): void {
//   const lat = this.latitud ?? -38.0055;   // default MDP
//   const lon = this.longitud ?? -57.5426;

//   const center: L.LatLngExpression = [lat, lon];

//   if (!this.map) {
//     // Crear mapa
//     this.map = L.map(this.mapContainer.nativeElement, {
//       center,
//       zoom: this.zoom,
//       zoomControl: true,
//       attributionControl: false,
//       scrollWheelZoom: true,
//       dragging: true,
//     });

//     L.tileLayer(environment.templateMapa, {
//       maxZoom: 19,
//     }).addTo(this.map);

//     // 👉 SIEMPRE poner pin en el centro inicial
//     this.colocarOMoverMarcador(lat, lon);

//     // Escuchar clicks del usuario
//     this.map.on('click', (e: L.LeafletMouseEvent) => {
//       const { lat, lng } = e.latlng;
//       this.colocarOMoverMarcador(lat, lng);

//       this.coordenadasSeleccionadas.emit({
//         latitud: lat,
//         longitud: lng,
//       });
//     });

//   } else {
//     // Actualizar vista si cambian las coords desde afuera
//     this.map.setView(center, this.zoom);

//     // También actualizo el pin al nuevo centro
//     this.colocarOMoverMarcador(lat, lon);
//   }
// }


//   private colocarOMoverMarcador(lat: number, lon: number): void {
//     const position: L.LatLngExpression = [lat, lon];

//     if (this.marker) {
//       this.marker.setLatLng(position);
//     } else {
//       this.marker = L.marker(position, {
//         icon: L.icon({
//           iconUrl: environment.iconoMapaPrincipal,
//           iconSize: [36, 36],
//           iconAnchor: [18, 36],
//           popupAnchor: [0, -30],
//         }),
//       }).addTo(this.map!);
//     }
//   }
// }





