import { Component, ElementRef, ViewChild } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { ObraService } from '../../../services/obra-service';
import { CategoriaObraDescripcion } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraDescripcion } from '../../../models/obraModels/estadoObraModel';

@Component({
  selector: 'app-obra-detalle',
  imports: [RouterLink],
  templateUrl: './obra-detalle.html',
  styleUrl: './obra-detalle.css',
})
export class ObraDetalle {

  obra?: ObraModel;
  cargando = true;

  imagenDefecto = `${environment.imgObra}`;
  nombreEstudio?: string;

  // Galería
  selectIndex = 0;

  //Carrusel miniaturas
  @ViewChild('carruselImagenes') carruselImagenes!: ElementRef;

  //Para mostrar el nombre prolijo de estado y categoria
  CategoriaObraDescripcion = CategoriaObraDescripcion;
  EstadoObraDescripcion = EstadoObraDescripcion;

  //Ventana de imagen
  ventanaAbierta = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obraSrvice: ObraService,
    private tokenSrvice: TokenService,
    private estudioSrvice: EstudioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { 
      this.router.navigate(['/obras']); 
      return; 
    }

    this.obraSrvice.getObra(id).subscribe({
      next: (data) => {
        this.obra = data;
        this.cargando = false;

        if (data.estudioId) {
          this.nombreEstudio = this.estudioSrvice.getNombreById(data.estudioId);

          if (!this.nombreEstudio) {
            this.estudioSrvice.getEstudio(data.estudioId).subscribe({
              next: est => {
                this.nombreEstudio = est.nombre;
                this.estudioSrvice.cachearNombre(est.id!, est.nombre);
              },
              error: () => this.nombreEstudio = 'Estudio desconocido',
            });
          }
        }
      },
      error: () => this.router.navigate(['/obras']),
    });
  }


  // Imágenes

  imgSrc(): string[] {
    const urls = this.obra?.urlsImagenes ?? [];
    if (!urls.length) return [this.imagenDefecto];

    return urls.map(u => {
     const path = u.startsWith('/') ? u : `/${u}`;
      return `${environment.apiUrl}${path}`;
    });
  }

  /** Imagen principal según el índice seleccionado. */
  imagenPrincipal(): string {
    const imgs = this.imgSrc();
    return imgs[Math.min(this.selectIndex, imgs.length - 1)];
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return; 
    img.src = this.imagenDefecto;
  }
    
  // --------- Interacción de la galería ----------
  seleccionarImg(index: number): void {
    this.selectIndex = index;
  }

  mover(paso: number): void {
    const n = this.imgSrc().length;
    if (n <= 1) return;

    this.selectIndex = (this.selectIndex + paso + n) % n;
  }

  scrollCarrusel(direccion: number) {
    const contenedor = this.carruselImagenes.nativeElement;
    const scrollAmount = 260; // ancho de imagen (240) + gap (10) + margen (10)
    contenedor.scrollLeft += scrollAmount * direccion;
  }
    
  // --- Ventana (imagen en grande) ---

  abrirVentana(i: number): void {
    this.selectIndex = i;
    this.ventanaAbierta = true;
  }

  cerrarVentana(): void {
    this.ventanaAbierta = false;
  }

  // Roles y acciones

  puedeGestionar(): boolean {
    return this.tokenSrvice.isAdmin() || this.tokenSrvice.isArquitecto();
  }

  editar(): void {
    if (!this.obra?.id) return;
    this.router.navigate(['/obras', this.obra.id, 'editar']);
  }

  eliminar(): void {
    if (!this.obra?.id) return;
    if (!confirm('¿Eliminar esta obra?')) return;
    
    this.obraSrvice.deleteObra(this.obra.id).subscribe({
      next: () => {
        alert('Obra eliminada correctamente.');
        this.router.navigate(['/obras']);
      },
      error: (e) => alert('No se pudo eliminar la obra.')
    });
  }
}
