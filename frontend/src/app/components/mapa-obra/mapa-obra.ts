import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import L from 'leaflet';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mapa-obra',
  imports: [],
  templateUrl: './mapa-obra.html',
  styleUrl: './mapa-obra.css',
})
export class MapaObra implements AfterViewInit, OnChanges, OnDestroy {

  @Input() latitud: number | null | undefined;
  @Input() longitud: number | null | undefined;
  @Input() nombre?: string;
  @Input() zoom: number = 16;

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    this.initOrUpdateMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['latitud'] || changes['longitud']) {
      this.initOrUpdateMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initOrUpdateMap(): void {
    if (this.latitud == null || this.longitud == null) {
      return; 
    }

    const center: L.LatLngExpression = [this.latitud, this.longitud];

    if (!this.map) {
      // Crear el mapa
      this.map = L.map(this.mapContainer.nativeElement, {
        center,
        zoom: this.zoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,   
        dragging: true
      });

      L.tileLayer(`${environment.templateMapa}`, {
        maxZoom: 19
      }).addTo(this.map);

      this.marker = L.marker(center, {
        icon: L.icon({
          iconUrl: `${environment.iconoMapaPrincipal}`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -30]
        })
      }).addTo(this.map);

      if (this.nombre) {
        this.marker.bindTooltip(this.nombre, { direction: 'top' });
      }
    } else {
      this.map.setView(center, this.zoom);

      if (this.marker) {
        this.marker.setLatLng(center);
      } else {
        this.marker = L.marker(center, {
          icon: L.icon({
            iconUrl: `${environment.iconoMapaPrincipal}`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -30]
          })
        }).addTo(this.map);
      }

      if (this.nombre) {
        this.marker.bindTooltip(this.nombre, { direction: 'top' });
      }
    }
  }
}
