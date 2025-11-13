import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { EstudioModel } from '../../../models/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { finalize, switchMap, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DragZoneImagenes } from "../../../components/drag-zone-imagenes/drag-zone-imagenes";

@Component({
  selector: 'app-estudio-form',
  imports: [ReactiveFormsModule, DragZoneImagenes],
  templateUrl: './estudio-form.html',
  styleUrl: './estudio-form.css',
})
export class EstudioForm {
  formulario!: FormGroup;
  id?: number;
  imagenActualUrl: string | null = null;
  imagenDefecto = `${environment.imgEstudio}`;
  editar = false;
  subiendo = false;  
  archivoSeleccionado: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private imagenService: ImagenService,
    private estudioService: EstudioService
  ) {}

  ngOnInit(): void {
    // La imagen es opcional; solo validamos el nombre
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],

      obrasIds: this.fb.control<number[]>([]),
      arquitectosIds: this.fb.control<number[]>([]),
      
    });

    const idParam = this.route.snapshot.params['id'];
      if (idParam) {
      this.editar = true;
      this.id = Number(idParam);
      this.cargarEstudio(this.id);
      }
  }

  private cargarEstudio(id: number): void {
    this.estudioService.getEstudio(id).pipe(take(1)).subscribe({
      next: (data) => {
        this.formulario.patchValue({ 
          nombre: data.nombre, 
          obrasIds: data.obrasIds ?? [],
          arquitectosIds: data.arquitectosIds ?? []
          });
        if (data.imagenUrl) {
          const path = data.imagenUrl.startsWith('/') ? data.imagenUrl : `/${data.imagenUrl}`;
          this.imagenActualUrl = `${environment.apiUrl}${path}`;
        }
      },
      error: () => alert('No se pudo cargar el estudio.'),
    });
  }


  guardar(event?: Event): void {
    event?.preventDefault(); // evita recargar la página

    const nombre = (this.formulario.get('nombre')?.value ?? '').trim();
    if (!nombre) {
      alert('Debe ingresar un nombre válido.');
      return;
    }

    this.subiendo = true;
    const archivo = this.archivoSeleccionado; // viene del hijo

    //Edición
    if (this.editar && this.id != null) {
      const obrasIds: number[] = this.formulario.get('obrasIds')?.value ?? [];
      const arquitectosIds: number[] = this.formulario.get('arquitectosIds')?.value ?? [];

      const updatePayload: EstudioModel = {
        id: this.id,
        nombre,
        ...(obrasIds.length ? { obrasIds } : {}),
        ...(arquitectosIds.length ? { arquitectosIds } : {}),
      };

      if (!archivo) {
        this.estudioService.updateEstudio(updatePayload)
          .pipe(finalize(() => this.subiendo = false))
          .subscribe({
            next: () => this.router.navigate(['/estudios', this.id]),
            error: () => alert('No se pudo actualizar.')
          });
      return;
    }

    this.imagenService.subirUna(archivo).pipe(
      take(1),
      switchMap(rutas => {
        const imagenUrl = rutas?.[0];
        if (!imagenUrl) throw new Error('Sin URL');
        return this.estudioService.updateImagenPerfil(this.id!, imagenUrl);
      }),
      switchMap(() => this.estudioService.updateEstudio(updatePayload)),
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => {
        this.archivoSeleccionado = null;
        this.router.navigate(['/estudios', this.id]);
      },
      error: () => alert('No se pudo actualizar.')
    });
    return;
  }

  // Creación
  if (!archivo) {
    this.estudioService.postEstudio({ nombre })
      .pipe(finalize(() => this.subiendo = false))
      .subscribe({
        next: () => {
          this.formulario.reset();
          this.archivoSeleccionado = null;
          alert('Estudio creado');
          this.router.navigate(['/estudios']);
        },
        error: () => alert('No se pudo crear el estudio.')
      });
    return;
  }

  this.imagenService.subirUna(archivo).pipe(take(1)).subscribe({
    next: rutas => {
      const imagenUrl = rutas?.[0];
      if (!imagenUrl) {
        this.subiendo = false;
        alert('Sin URL de imagen');
        return;
      }
      this.estudioService.postEstudio({ nombre, imagenUrl })
        .pipe(finalize(() => this.subiendo = false))
        .subscribe({
          next: () => {
            this.formulario.reset();
            this.archivoSeleccionado = null;
            alert('Estudio creado');
          },
          error: () => alert('No se pudo crear el estudio.')
        });
      },
      error: () => {
        this.subiendo = false;
        alert('No se pudo subir la imagen.');
      }
   });
  }
 
  // Fallback de imagen para el (error) del <img>
  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (!img) return;
    if (img.src.includes(this.imagenDefecto)) return; // evita loop
    img.src = this.imagenDefecto;
  }

  // Eliminar un arquitecto del estudio (solo en edición)
  quitarArquitecto(arqId: number): void {
    if (!this.editar || !this.id) return;
    if (!confirm('¿Quitar este arquitecto del estudio?')) return;

    this.estudioService.eliminarArquitecto(this.id, arqId).pipe(take(1)).subscribe({
      next: (estudioActualizado) => {
        // Si tu endpoint devuelve el EstudioModel actualizado:
        if (estudioActualizado && Array.isArray(estudioActualizado.arquitectosIds)) {
          this.formulario.get('arquitectosIds')?.setValue(estudioActualizado.arquitectosIds);
        } else {
          // Si NO devuelve actualizado, actualizamos localmente:
          const actuales = (this.formulario.get('arquitectosIds')?.value ?? []) as number[];
          this.formulario.get('arquitectosIds')?.setValue(actuales.filter(x => x !== arqId));
        }
      },
      error: () => alert('No se pudo quitar el arquitecto'),
    });
  }

}
  
 