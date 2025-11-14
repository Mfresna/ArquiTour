import { Component, OnInit } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { environment } from '../../../../environments/environment';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObraService } from '../../../services/obra-service';
import { CategoriaObraDescripcion, CategoriaObraModel } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraDescripcion, EstadoObraModel } from '../../../models/obraModels/estadoObraModel';
import { EstudioModel } from '../../../models/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';

@Component({
  selector: 'app-obras',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './obras.html',
  styleUrl: './obras.css',
})
export class Obras implements OnInit {

  obras: ObraModel[]= [];
  imagenDefecto = `${environment.imgObra}`;
  filtro!: FormGroup; 


  categorias = Object.values(CategoriaObraModel);
  estados = Object.values(EstadoObraModel);
  CategoriaObraDescripcion = CategoriaObraDescripcion;
  EstadoObraDescripcion    = EstadoObraDescripcion;
  
  estudios: EstudioModel[]= [];
 
  constructor(
    private fb: FormBuilder,
    private obraService: ObraService,
    private estudioService: EstudioService
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      categoria: [''],
      estado: [''],
      estudioId: [''],
      nombre: [''],
    });

    this.cargarEstudiosFiltro();

    this.cargarObras();
  }

  //Trae estudios para mostrar en el filtro
  private cargarEstudiosFiltro(): void {
    this.estudioService.getFiltrarEstudios().subscribe({
      next: lista => {
        this.estudios = lista ?? [];

        // Cachear todos los nombres para usarlos desde cualquier componente
        for (const e of this.estudios) {
          if (e.id && e.nombre) {
            this.estudioService.cachearNombre(e.id, e.nombre);
          }
        }
      },
      error: () => alert('No se pudieron cargar los estudios'),
      });
    }

  cargarObras(): void {
    const obra = this.filtro.value;

    this.obraService.getFiltrarObras(
      obra.categoria || undefined,
      obra.estado    || undefined,
      obra.estudioId ? Number(obra.estudioId) : undefined,
      obra.nombre?.trim() || undefined
    )
    .subscribe({
      next: lista => this.obras = lista,
      error: () => alert('No se pudo cargar la lista de obras'),
    });
  }

  limpiarFiltro(): void {
    this.filtro.reset({ 
      categoria: '', 
      estado: '', 
      estudioId: '', 
      nombre: '' 
    });
    this.cargarObras();
  }

  nombreEstudio(estudioId?: number): string {
    if (!estudioId) return 'Estudio no especificado';
    return this.estudioService.getNombreById(estudioId) ?? 'Estudio desconocido';
  }

  //Imágenes

  imagenUrl(urls?: string[]): string {
    if (!urls || urls.length === 0) return this.imagenDefecto;
    const primera = urls[0];
    return `${environment.apiUrl}${primera}`;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return;
    img.src = this.imagenDefecto;
  }

}
