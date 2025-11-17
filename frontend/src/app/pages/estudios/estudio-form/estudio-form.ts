import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { finalize, switchMap, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DragZoneImagenes } from "../../../components/drag-zone-imagenes/drag-zone-imagenes";
import { DragZoneSimple } from '../../../components/drag-zone-simple/drag-zone-simple';

@Component({
  selector: 'app-estudio-form',
  imports: [ReactiveFormsModule, DragZoneSimple],
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
  imagenUrlExistente = false;
  quitadoImg: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private imagenService: ImagenService,
    private estudioService: EstudioService
  ) {}

  ngOnInit(): void {
    // La imagen es opcional, solo validamos el nombre
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
        
        if (data.imagenUrl && !this.esImagenPorDefecto(data.imagenUrl)) {
          const path = data.imagenUrl.startsWith('/') ? data.imagenUrl : `/${data.imagenUrl}`;
          this.imagenActualUrl = `${environment.apiUrl}${path}`;

          this.imagenUrlExistente = true;
          this.quitadoImg = false;

        } else {
          // si no tiene propia o es la default -> drag vacío
          this.imagenActualUrl = null;
          this.imagenUrlExistente = false;
          this.quitadoImg = false;
        }
      },
      error: () => alert('No se pudo cargar el estudio.'),
    });
  }

  private esImagenPorDefecto(imagenUrl: string): boolean {

    const soloPath = imagenUrl.replace(/^https?:\/\/[^/]+/, ''); 

    const defNormalizada = this.imagenDefecto.startsWith('/')
      ? this.imagenDefecto
      : `/${this.imagenDefecto}`;

    return soloPath === defNormalizada;
  }





        //==============================================================================================================
//   guardar(event?: Event): void {
//     event?.preventDefault();

//     const nombre = (this.formulario.get('nombre')?.value ?? '').trim();
//     if (!nombre) {
//       alert('Debe ingresar un nombre válido.');
//       return;
//     }

//     this.subiendo = true;
//     const archivo = this.archivoSeleccionado; 

//     //Edición
//     if (this.editar && this.id != null) {
//       const obrasIds: number[] = this.formulario.get('obrasIds')?.value ?? [];
//       const arquitectosIds: number[] = this.formulario.get('arquitectosIds')?.value ?? [];

//       const updatePayload: EstudioModel = {
//         id: this.id,
//         nombre,
//         ...(obrasIds.length ? { obrasIds } : {}),
//         ...(arquitectosIds.length ? { arquitectosIds } : {}),
//       };


//       alert(this.imagenUrlExistente!);
//       alert(this.quitadoImg);


//       //==============================================================================================================

//       // CASO 1: Tenía imagen, la quitó y NO subió otra
//       if (this.imagenUrlExistente && this.quitadoImg && !archivo) {
//         this.estudioService.updateImagenPerfil(this.id!, null).pipe(
//           switchMap(() => this.estudioService.updateEstudio(updatePayload)),
//           finalize(() => this.subiendo = false)
//         ).subscribe({
//           next: () => this.router.navigate(['/estudios', this.id]),
//           error: () => alert('No se pudo actualizar.')
//         });
//         return;
//       }

//       //CASO2: No tocó la imagen y no hay archivo nuevo
//       if (!archivo) {
//         this.estudioService.updateEstudio(updatePayload)
//           .pipe(finalize(() => this.subiendo = false))
//           .subscribe({
//             next: () => this.router.navigate(['/estudios', this.id]),
//             error: () => alert('No se pudo actualizar.')
//           });
//         return;
//       }

//       //CASO 3: Hay archivo nuevo
//       this.imagenService.subirUna(archivo).pipe(
//         take(1),
//         switchMap(rutas => {
//           const imagenUrl = rutas?.[0];
//           if (!imagenUrl) throw new Error('Sin URL');
//           return this.estudioService.updateImagenPerfil(this.id!, imagenUrl);
//         }),
//         switchMap(() => this.estudioService.updateEstudio(updatePayload)),
//         finalize(() => this.subiendo = false)
//       ).subscribe({
//         next: () => {
//           this.archivoSeleccionado = null;
//           this.router.navigate(['/estudios', this.id]);
//         },
//         error: () => alert('No se pudo actualizar.')
//       });
//      return;
//     }

// //==============================================================================================================


//   // Creación
//   if (!archivo) {
//     this.estudioService.postEstudio({ nombre })
//       .pipe(finalize(() => this.subiendo = false))
//       .subscribe({
//         next: () => {
//           this.formulario.reset();
//           this.archivoSeleccionado = null;
//           alert('Estudio creado');
//           this.router.navigate(['/estudios']);
//         },
//         error: () => alert('No se pudo crear el estudio.')
//       });
//     return;
//   }

//   this.imagenService.subirUna(archivo).pipe(take(1)).subscribe({
//     next: rutas => {
//       const imagenUrl = rutas?.[0];
//       if (!imagenUrl) {
//         this.subiendo = false;
//         alert('Sin URL de imagen');
//         return;
//       }
//       this.estudioService.postEstudio({ nombre, imagenUrl })
//         .pipe(finalize(() => this.subiendo = false))
//         .subscribe({
//           next: () => {
//             this.formulario.reset();
//             this.archivoSeleccionado = null;
//             alert('Estudio creado');
//           },
//           error: () => alert('No se pudo crear el estudio.')
//         });
//       },
//       error: () => {
//         this.subiendo = false;
//         alert('No se pudo subir la imagen.');
//       }
//    });
//   }
 
//   // Fallback de imagen para el (error) del <img>
//   imagenError(ev: Event): void {
//     const img = ev.target as HTMLImageElement;
//     if (!img) return;
//     if (img.src.includes(this.imagenDefecto)) return; // evita loop
//     img.src = this.imagenDefecto;
//   }

//   // Eliminar un arquitecto del estudio (solo en edición)
//   quitarArquitecto(arqId: number): void {
//     if (!this.editar || !this.id) return;
//     if (!confirm('¿Quitar este arquitecto del estudio?')) return;

//     this.estudioService.eliminarArquitecto(this.id, arqId).pipe(take(1)).subscribe({
//       next: (estudioActualizado) => {
//         // Si tu endpoint devuelve el EstudioModel actualizado:
//         if (estudioActualizado && Array.isArray(estudioActualizado.arquitectosIds)) {
//           this.formulario.get('arquitectosIds')?.setValue(estudioActualizado.arquitectosIds);
//         } else {
//           // Si NO devuelve actualizado, actualizamos localmente:
//           const actuales = (this.formulario.get('arquitectosIds')?.value ?? []) as number[];
//           this.formulario.get('arquitectosIds')?.setValue(actuales.filter(x => x !== arqId));
//         }
//       },
//       error: () => alert('No se pudo quitar el arquitecto'),
//     });
//   }

//         //==============================================================================================================

guardar(event?: Event): void {
  event?.preventDefault();

  const nombre = (this.formulario.get('nombre')?.value ?? '').trim();
  if (!nombre) {
    alert('Debe ingresar un nombre válido.');
    return;
  }

  this.subiendo = true;
  const archivo = this.archivoSeleccionado;

  if (this.editar && this.id != null) {
    this.guardarEdicion(nombre, archivo);
  } else {
    this.guardarCreacion(nombre, archivo);
  }
}

/* ===================== EDICIÓN ===================== */

private guardarEdicion(nombre: string, archivo: File | null): void {
  
  const updatePayload: EstudioModel = this.buildUpdatePayload(nombre);

  const tieneImagenOriginal = !!this.imagenUrlExistente;

  // CASO 1: Tenía imagen, la quitó y NO subió otra
  if (tieneImagenOriginal && this.quitadoImg && !archivo) {
    this.estudioService.updateImagenPerfil(this.id!, null).pipe(
      switchMap(() => this.estudioService.updateEstudio(updatePayload)),
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => this.onUpdateSuccess(false),
      error: () => this.onUpdateError()
    });
    return;
  }

  // CASO 2: No tocó la imagen y no hay archivo nuevo
  if (!archivo) {
    this.estudioService.updateEstudio(updatePayload).pipe(
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => this.onUpdateSuccess(false),
      error: () => this.onUpdateError()
    });
    return;
  }

  // CASO 3: Hay archivo nuevo
  this.imagenService.subirUna(archivo).pipe(
    take(1),
    switchMap(rutas => {
      const imagenUrl = rutas?.[0];
      if (!imagenUrl) throw new Error('Sin URL de imagen');
      return this.estudioService.updateImagenPerfil(this.id!, imagenUrl);
    }),
    switchMap(() => this.estudioService.updateEstudio(updatePayload)),
    finalize(() => this.subiendo = false)
  ).subscribe({
    next: () => this.onUpdateSuccess(true),
    error: () => this.onUpdateError()
  });
}

private buildUpdatePayload(nombre: string): EstudioModel {
  const obrasIds: number[] = this.formulario.get('obrasIds')?.value ?? [];
  const arquitectosIds: number[] = this.formulario.get('arquitectosIds')?.value ?? [];

  return {
    id: this.id!,
    nombre,
    ...(obrasIds.length ? { obrasIds } : {}),
    ...(arquitectosIds.length ? { arquitectosIds } : {}),
  };
}

private onUpdateSuccess(resetArchivo: boolean): void {
  if (resetArchivo) {
    this.archivoSeleccionado = null;
  }
  this.router.navigate(['/estudios', this.id]);
}

private onUpdateError(): void {
  alert('No se pudo actualizar.');
}

/* ===================== CREACIÓN ===================== */

private guardarCreacion(nombre: string, archivo: File | null): void {
  // Sin imagen
  if (!archivo) {
    this.estudioService.postEstudio({ nombre }).pipe(
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => this.onCreateSuccess(),
      error: () => alert('No se pudo crear el estudio.')
    });
    return;
  }

  // Con imagen
  this.imagenService.subirUna(archivo).pipe(
    take(1),
    switchMap(rutas => {
      const imagenUrl = rutas?.[0];
      if (!imagenUrl) {
        throw new Error('Sin URL de imagen');
      }
      return this.estudioService.postEstudio({ nombre, imagenUrl });
    }),
    finalize(() => this.subiendo = false)
  ).subscribe({
    next: () => this.onCreateSuccess(),
    error: () => alert('No se pudo crear el estudio.')
  });
}

private onCreateSuccess(): void {
  this.formulario.reset();
  this.archivoSeleccionado = null;
  alert('Estudio creado');
  this.router.navigate(['/estudios']);
}

/* ===================== OTROS MÉTODOS ===================== */

imagenError(ev: Event): void {
  const img = ev.target as HTMLImageElement | null;
  if (!img) return;
  if (img.src.includes(this.imagenDefecto)) return; // evita loop
  img.src = this.imagenDefecto;
}

quitarArquitecto(arqId: number): void {
  if (!this.editar || !this.id) return;
  if (!confirm('¿Quitar este arquitecto del estudio?')) return;

  this.estudioService.eliminarArquitecto(this.id, arqId).pipe(take(1)).subscribe({
    next: (estudioActualizado) => {
      if (estudioActualizado && Array.isArray(estudioActualizado.arquitectosIds)) {
        this.formulario.get('arquitectosIds')?.setValue(estudioActualizado.arquitectosIds);
      } else {
        const actuales = (this.formulario.get('arquitectosIds')?.value ?? []) as number[];
        this.formulario.get('arquitectosIds')?.setValue(actuales.filter(x => x !== arqId));
      }
    },
    error: () => alert('No se pudo quitar el arquitecto'),
  });
}




















}
  
 