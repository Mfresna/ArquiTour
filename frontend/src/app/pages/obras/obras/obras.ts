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

  obras!: ObraModel[];
  imagenDefecto = `${environment.imgObra}`;
  filtro!: FormGroup; 

  //Para el select de Estudios
  estudios!: EstudioModel[];
  estudiosFiltrados!: EstudioModel[];
  selectEstudioAbierto = false;
  buscarEstudio = new FormControl<string>(''); // input reactivo del buscador

  //Mapas de descripción para mostrar en el HTML 
  categorias = Object.values(CategoriaObraModel);
  estados = Object.values(EstadoObraModel);
  CategoriaObraDescripcion = CategoriaObraDescripcion;
  EstadoObraDescripcion    = EstadoObraDescripcion;

 

  constructor(
    private fb: FormBuilder,
    private obraService: ObraService,
    private estudioService: EstudioService
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      categoria: [''],
      estado: [''],
      estudioId: [null],
      nombre: [''],
    });

    this.cargarEstudiosFiltro();

    // 2) Conectar el buscador del select 
    this.buscarEstudio.valueChanges.subscribe((q) => {
      const s = (q ?? '').trim().toLowerCase();
      this.estudiosFiltrados = !s
        ? this.estudios
        : this.estudios.filter(e => (e.nombre ?? '').toLowerCase().includes(s));
    });

    this.cargarObras();
  }

  //Trae estudios para mostrar en el filtro
  private cargarEstudiosFiltro(): void {
    //VER
    this.estudioService.precargarTodos().subscribe({
      next: lista => {
        this.estudios = this.estudioService.estudios ?? [];
        this.estudiosFiltrados = this.estudios;
      },
        error: () => {
          alert('No se pudieron cargar los estudios');
        }
      });
    }

  cargarObras(): void {
    const categoria = this.filtro.value.categoria || undefined;
    const estado    = this.filtro.value.estado || undefined;

    // si hay algo en estudioId, lo paso a número; si no, no lo envío
    const estudioId = (this.filtro.value.estudioId !== null && this.filtro.value.estudioId !== '')
      ? Number(this.filtro.value.estudioId)
      : undefined;

    const nombre = (this.filtro.value.nombre ?? '').trim() || undefined;

    this.obraService.getFiltrarObras(categoria, estado, estudioId, nombre).subscribe({
      next: lista => this.obras = lista,
      error: () => alert('No se pudo cargar la lista de obras'),
    });
  }

  limpiarFiltro(): void {
    this.filtro.reset({ categoria: '', estado: '', estudioId: null, nombre: '' });
    this.buscarEstudio.setValue(''); // limpieza del buscador del dropdown
    this.estudiosFiltrados = this.estudios;
    this.cargarObras();
  }


  // Select de estudios
  //VER

  selectEstudio(force?: boolean): void {
    this.selectEstudioAbierto = force ?? !this.selectEstudioAbierto;
    if (this.selectEstudioAbierto) {
      // al abrir, resetea el buscador y muestra todos
      this.buscarEstudio.setValue('');
      this.estudiosFiltrados = this.estudios;
    }
  }

  // Al seleccionar un estudio, guarda SOLO el id en el form 
  seleccionarEstudio(e: EstudioModel | null): void {
    this.filtro.patchValue({ estudioId: e?.id ?? null });
    this.selectEstudioAbierto = false;
  }

  // Texto que se ve en el botón del select cuando está cerrado
  etiquetaEstudioSeleccionado(): string {
    const id = this.filtro.value.estudioId;
    if (!id) return 'Todos los estudios';
    return this.estudioService.getNombreById(Number(id)) ?? 'Estudio desconocido';
  }

  // Mostrar nombre del estudio en el listado (sin exponer id)
  //VER
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
