import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { EstudioModel } from '../../../models/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { finalize, switchMap, take } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-estudios-formularios',
  imports: [ReactiveFormsModule],
  templateUrl: './estudios-formularios.html',
  styleUrl: './estudios-formularios.css',
})
export class EstudiosFormularios {
  formulario!: FormGroup;
  id?: number;
  imagenActualUrl?: string;
  editar = false;
  

  // Estado relacionado a la imagen
  imagenSeleccionada: File | null = null;   // archivo temporal seleccionado por el usuario
  vistaPrevia: string | null = null;        // URL temporal para previsualizar la imagen
  subiendo = false;                         // estado de proceso de guardado

  // Referencia al input de archivos (para abrir el explorador al hacer click en el área)
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

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

  abrirExplorador(): void {
    this.inputArchivo?.nativeElement.click();
  }

  
  //Maneja selección de archivo desde el input.
  //Solo guarda en memoria y arma vista previa; no sube todavía.
   
  seleccionarDesdeInput(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;
    if (!archivo) return;
    this.setArchivoSeleccionado(archivo);
  }

  //Maneja soltar archivo(s) sobre el área.
  soltarArchivo(evento: DragEvent): void {
    evento.preventDefault();
    const archivo = evento.dataTransfer?.files?.[0] ?? null;
    if (!archivo) return;
    this.setArchivoSeleccionado(archivo);
  }

  permitirSoltar(evento: DragEvent): void {
    evento.preventDefault();
  }

  //Asigna el archivo como imagen seleccionada y genera la vista previa.
  //Podés filtrar tipos/extensión/tamaño aquí si lo necesitás.

  private setArchivoSeleccionado(archivo: File): void {
    this.imagenSeleccionada = archivo;

    // limpiar vista previa previa (si existe) y generar una nueva
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  //Limpia la selección local (por si el usuario se arrepiente).
  limpiarImagen(): void {
    this.imagenSeleccionada = null;
    if (this.vistaPrevia) {
      URL.revokeObjectURL(this.vistaPrevia);
      this.vistaPrevia = null;
    }
    if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';
  }
  // Fallback de imagen para el (error) del <img>
onImgError(ev: Event): void {
  const img = ev.target as HTMLImageElement;
  if (!img) return;
  if (img.src.includes('assets/img/descarga.png')) return; // evita loop
  img.src = 'assets/img/descarga.png';
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


  
   //Guardar:
   // - Si hay imagen seleccionada: primero se sube, luego se crea el estudio con imagenUrl.
   // - Si no hay imagen: se crea el estudio sin imagenUrl (la vista usará la imagen por defecto).
  guardar(): void {
  const nombre: string = (this.formulario.get('nombre')?.value ?? '').trim();
  if (!nombre) {
    alert('Debe ingresar un nombre válido.');
    return;
  }

  this.subiendo = true;

 
  // MODO EDICIÓN 

  if (this.editar && this.id != null) {
    const obrasIds: number[] = this.formulario.get('obrasIds')?.value ?? [];
    const arquitectosIds: number[] = this.formulario.get('arquitectosIds')?.value ?? [];

    // payload base + sólo agrego arrays si traen contenido (no piso con [])
    const updatePayload: EstudioModel = {
      id: this.id,
      nombre,
      ...(obrasIds.length ? { obrasIds } : {}),
      ...(arquitectosIds.length ? { arquitectosIds } : {}),
    };

    // a) SIN nueva imagen → sólo PUT
    if (!this.imagenSeleccionada) {
      this.estudioService.updateEstudio(updatePayload)
        .pipe(finalize(() => (this.subiendo = false)))
        .subscribe({
          next: () => { alert('¡Actualizado!'); this.router.navigate(['/estudios', this.id]); },
          error: () => alert('No se pudo actualizar.')
        });
      return;
    }

    // b) CON nueva imagen → subir → PATCH imagen → PUT
    const id = this.id;                     
    const archivo = this.imagenSeleccionada as File; 

    this.imagenService.subirUna(archivo).pipe(
      take(1),
      //Toma la 1er url y sino salta al error del suscribe
      switchMap((rutas: string[]) => {
        const imagenUrl = rutas?.[0];
        if (!imagenUrl) throw new Error('No se recibió URL de imagen.');
        return this.estudioService.updateImagenPerfil(id, imagenUrl);
      }),
      switchMap(() => this.estudioService.updateEstudio(updatePayload)),
      finalize(() => (this.subiendo = false))
    ).subscribe({
      next: () => { alert('¡Actualizado!'); 
      this.router.navigate(['/estudios/', id]); },
      error: () => alert('No se pudo actualizar.')
    });

    return;
  }

  // MODO CREACIÓN 
 
  // Caso A: sin imagen → crear estudio sin imagenUrl
  if (!this.imagenSeleccionada) {
    const payload: EstudioModel = { nombre };
    this.estudioService.postEstudio(payload).subscribe({
      next: () => this.finalizarGuardado(true),
      error: (err) => this.finalizarGuardado(false, 'No se pudo crear el estudio.', err),
    });
    return;
  }

  // Caso B: con imagen → subir y luego crear estudio con imagenUrl
  const archivo = this.imagenSeleccionada as File; // estabiliza tipo File
  this.imagenService.subirUna(archivo).subscribe({
    next: (rutas: string[]) => {
      const imagenUrl = rutas?.[0];
      if (!imagenUrl) {
        this.finalizarGuardado(false, 'No se recibió URL de imagen.');
        return;
      }
      const payload: EstudioModel = { nombre, imagenUrl };
      this.estudioService.postEstudio(payload).subscribe({
        next: () => this.finalizarGuardado(true),
        error: (err) => this.finalizarGuardado(false, 'No se pudo crear el estudio.', err),
      });
    },
    error: (err) => this.finalizarGuardado(false, 'No se pudo subir la imagen.', err),
  });
}


  
  //Manejo común para completar el flujo de guardado.
  private finalizarGuardado(exito: boolean, mensajeError?: string, error?: any): void {
    this.subiendo = false;

    if (exito) {
      // limpiar formulario y previsualización
      this.formulario.reset();
      this.limpiarImagen();
      alert('Estudio creado con éxito.');
      return;
    }

    console.error(mensajeError, error);
    alert(mensajeError || 'Ocurrió un error.');
  }























  // estudio!: FormGroup;
  // id!: string;
  // editar!: boolean;
  // imagenSeleccionada: File | null = null;
  // urlImagenSubida!: string;
  // vistaPrevia: string | null = null;         
  // guardando = false;
  

  // readonly imagenDefecto = 'assets/img/descarga.png';

  // constructor(
  //   private fb: FormBuilder,
  //   private router: Router,
  //   private imagenService: ImagenService,
  //   private estudioService: EstudioService
  // ) {}

  // ngOnInit(): void {
  //   // Solo el nombre es obligatorio; la imagen es opcional
  //   this.estudio = this.fb.group({
  //     nombre: ['', [Validators.required]],
  //   });
  // }

  // /**
  //  * Toma el archivo seleccionado y genera una vista previa local.
  //  * No sube la imagen todavía.
  //  */
  // seleccionarArchivo(evento: Event): void {
  //   const input = evento.target as HTMLInputElement;
  //   const archivo = input.files?.[0];
  //   if (!archivo) return;

  //   this.imagenSeleccionada = archivo;

  //   // Generar una URL temporal para previsualizar la imagen
  //   if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
  //   this.vistaPrevia = URL.createObjectURL(archivo);
  // }

  // /**
  //  * Guarda el estudio.
  //  * - Si hay imagen seleccionada: primero la sube y luego guarda el estudio con la URL.
  //  * - Si no hay imagen: guarda el estudio sin imagenUrl (el listado mostrará la imagen por defecto).
  //  */
  // guardarEstudio(): void {
  //   const nombre: string = (this.estudio.get('nombre')?.value ?? '').trim();
  //   if (!nombre) {
  //     alert('Debe ingresar un nombre para el estudio.');
  //     return;
  //   }

  //   this.guardando = true;

  //   // Caso 1: el usuario NO seleccionó imagen → guardar directamente sin imagenUrl
  //   if (!this.imagenSeleccionada) {
  //     const payload: EstudioModel = {
  //       nombre: nombre,
  //       // imagenUrl: undefined   // dejar sin enviar para que el listado muestre la imagen por defecto
  //     };

  //     this.estudioService.postEstudio(payload).subscribe({
  //       next: () => this.resetearFormulario(),
  //       error: (err) => {
  //         console.error('Error al crear el estudio:', err);
  //         alert('No se pudo crear el estudio.');
  //         this.guardando = false;
  //       },
  //       complete: () => {
  //         this.guardando = false;
  //         alert('Estudio creado con éxito.');
  //       }
  //     });

  //     return;
  //   }

  //   // Caso 2: el usuario SÍ seleccionó imagen → subir y luego guardar
  //   this.imagenService.subirUna(this.imagenSeleccionada).subscribe({
  //     next: (rutas: string[]) => {
  //       this.urlImagenSubida = rutas?.[0];

  //       const payload: EstudioModel = {
  //         nombre: nombre,
  //         imagenUrl: this.urlImagenSubida
  //       };

  //       this.estudioService.postEstudio(payload).subscribe({
  //         next: () => this.resetearFormulario(),
  //         error: (err) => {
  //           console.error('Error al crear el estudio:', err);
  //           alert('No se pudo crear el estudio.');
  //           this.guardando = false;
  //         },
  //         complete: () => {
  //           this.guardando = false;
  //           alert('Estudio creado con éxito.');
  //         }
  //       });
  //     },
  //     error: (err) => {
  //       console.error('Error al subir la imagen:', err);
  //       alert('No se pudo subir la imagen.');
  //       this.guardando = false;
  //     }
  //   });
  // }

  // /**
  //  * Limpia el formulario y la vista previa para dejar todo en estado inicial.
  //  */
  // private resetearFormulario(): void {
  //   this.estudio.reset();
  //   this.imagenSeleccionada = null;

  //   if (this.vistaPrevia) {
  //     URL.revokeObjectURL(this.vistaPrevia);
  //     this.vistaPrevia = null;
  //   }
  // }
}


