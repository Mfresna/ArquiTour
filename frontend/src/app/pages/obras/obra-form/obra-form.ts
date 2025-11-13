import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DragZoneImagenes } from '../../../components/drag-zone-imagenes/drag-zone-imagenes';
import { ActivatedRoute, Router } from '@angular/router';
import { take, finalize, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoriaObraModel, CategoriaObraDescripcion } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraModel, EstadoObraDescripcion } from '../../../models/obraModels/estadoObraModel';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { ObraService } from '../../../services/obra-service';
import { EstudioModel } from '../../../models/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { ObraModel } from '../../../models/obraModels/obraModel';

@Component({
  selector: 'app-obra-form',
  imports: [ReactiveFormsModule, DragZoneImagenes],
  templateUrl: './obra-form.html',
  styleUrl: './obra-form.css',
})
export class ObraForm {
  formulario!: FormGroup;
  editar = false;
  id?: number;

  // Preview
  imagenActualUrl: string | null = null;
  imagenDefecto = `${environment.imgObra}`;
  archivoSeleccionado: File | null = null;

  subiendo = false;

  categorias = Object.values(CategoriaObraModel);
  estados    = Object.values(EstadoObraModel);
  CategoriaObraDescripcion = CategoriaObraDescripcion;
  EstadoObraDescripcion    = EstadoObraDescripcion;

  estudios: EstudioModel[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private imagenService: ImagenService,
    private obraService: ObraService,
    private estudioService: EstudioService,
  ) {}

  ngOnInit(): void {

    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      categoria: ['', [Validators.required]],      
      estado:    ['', [Validators.required]],        
      estudioId: ['', [Validators.required]],         
      anioEstado: ['', [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      latitud: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.cargarEstudios();

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.editar = true;
      this.id = Number(idParam);
      this.cargarObra(this.id);
    }
  }

  //Trae estudios para mostrar en el select
  private cargarEstudios(): void {
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


  //Traduce estado y categoria en modo edición
  private extraerCodigoCategoria(c: any): CategoriaObraModel | '' {
    if (!c) return '';
    return (typeof c === 'string' ? c : c.codigo ?? '') as CategoriaObraModel | '';
  }
  private extraerCodigoEstado(e: any): EstadoObraModel | '' {
    if (!e) return '';
    return (typeof e === 'string' ? e : e.codigo ?? '') as EstadoObraModel | '';
  }

  private cargarObra(id: number): void {
    this.obraService.getObra(id).pipe(take(1)).subscribe({
      next: (obra) => {
        this.formulario.patchValue({
          nombre: obra.nombre ?? '',
          categoria: this.extraerCodigoCategoria(obra.categoria),
          estado:    this.extraerCodigoEstado(obra.estado),
          estudioId: obra.estudioId ?? '',
          anioEstado: obra.anioEstado ?? '',
          latitud: obra.latitud ?? '',
          longitud: obra.longitud ?? '',
          descripcion: obra.descripcion ?? '',
        });

        if (obra.urlsImagenes?.length) {
          const img = obra.urlsImagenes[0];
          const path = img.startsWith('/') ? img : `/${img}`;
          this.imagenActualUrl = `${environment.apiUrl}${path}`;
        } else {
          this.imagenActualUrl = this.imagenDefecto;
        }
      },
      error: () => alert('No se pudo cargar la obra.'),
    });
  }

  guardar(event?: Event): void {
  event?.preventDefault();

  // Validación mínima al estilo Estudio (nombre obligatorio)
  const nombre = (this.formulario.get('nombre')?.value ?? '').trim();
  if (!nombre) {
    alert('Debe ingresar un nombre válido.');
    return;
  }

  // Tomo el resto de campos desde el form 
  const categoria   = this.formulario.get('categoria')?.value as CategoriaObraModel | null;
  const estado      = this.formulario.get('estado')?.value as EstadoObraModel | null;
  const estudioId   = Number(this.formulario.get('estudioId')?.value ?? NaN);
  const anioEstado  = Number(this.formulario.get('anioEstado')?.value ?? NaN);
  const latitud     = Number(this.formulario.get('latitud')?.value ?? NaN);
  const longitud    = Number(this.formulario.get('longitud')?.value ?? NaN);
  const descripcion = (this.formulario.get('descripcion')?.value ?? '').trim();

  // (Opcional) chequeo rápido de los requeridos del DTO
  if (!categoria || !estado || !estudioId || isNaN(anioEstado) || isNaN(latitud) || isNaN(longitud) || !descripcion) {
    alert('Complete correctamente los campos obligatorios.');
    return;
  }

  this.subiendo = true;
  const archivo = this.archivoSeleccionado; // File | null

  // ===== EDICIÓN =====
  if (this.editar && this.id != null) {
    const updatePayload: ObraModel = {
      id: this.id,
      nombre,
      categoria,
      estado,
      estudioId,
      anioEstado,
      latitud,
      longitud,
      descripcion,
      // urlsImagenes: (solo si se sube nueva imagen)
    };

    // Sin cambio de imagen
    if (!archivo) {
      this.obraService.updateObra(updatePayload)
        .pipe(finalize(() => this.subiendo = false))
        .subscribe({
          next: () => this.router.navigate(['/obras', this.id]),
          error: () => alert('No se pudo actualizar la obra.')
        });
      return;
    }

    // Con imagen: subo y actualizo poniendo portada
    this.imagenService.subirUna(archivo).pipe(
      take(1),
      switchMap(rutas => {
        const imagenUrl = rutas?.[0];
        if (!imagenUrl) throw new Error('Sin URL de imagen');
        return this.obraService.updateObra({ ...updatePayload, urlsImagenes: [imagenUrl] });
      }),
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => {
        this.archivoSeleccionado = null;
        this.router.navigate(['/obras', this.id!]);
      },
      error: () => alert('No se pudo actualizar la obra.')
    });
    return;
  }

  // ===== CREACIÓN =====
  const createPayload: ObraModel = {
    nombre,
    categoria,
    estado,
    estudioId,
    anioEstado,
    latitud,
    longitud,
    descripcion,
    // urlsImagenes: (solo si se sube imagen)
  };

  // Sin imagen
  if (!archivo) {
    this.obraService.postObra(createPayload)
      .pipe(finalize(() => this.subiendo = false))
      .subscribe({
        next: () => {
          this.formulario.reset();
          this.archivoSeleccionado = null;
          alert('Obra creada');
          this.router.navigate(['/obras']);
        },
        error: () => alert('No se pudo crear la obra.')
      });
    return;
  }

  // Con imagen: subo y creo con portada
  this.imagenService.subirUna(archivo).pipe(take(1)).subscribe({
    next: rutas => {
      const imagenUrl = rutas?.[0];
      if (!imagenUrl) {
        this.subiendo = false;
        alert('Sin URL de imagen');
        return;
      }
      this.obraService.postObra({ ...createPayload, urlsImagenes: [imagenUrl] })
        .pipe(finalize(() => this.subiendo = false))
        .subscribe({
          next: () => {
            this.formulario.reset();
            this.archivoSeleccionado = null;
            alert('Obra creada');
            this.router.navigate(['/obras']);
          },
          error: () => alert('No se pudo crear la obra.')
        });
      },
      error: () => {
        this.subiendo = false;
        alert('No se pudo subir la imagen.');
      }
    });
  } 

}