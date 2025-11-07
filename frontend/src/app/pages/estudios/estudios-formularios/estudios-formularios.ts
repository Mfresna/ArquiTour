import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { EstudioModel } from '../../../models/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { finalize, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-estudios-formularios',
  imports: [ReactiveFormsModule],
  templateUrl: './estudios-formularios.html',
  styleUrl: './estudios-formularios.css',
})
export class EstudiosFormularios {
  formulario!: FormGroup;
  idEstudio?: number;
  modoEdicion = false;

  // Estado relacionado a la imagen
  imagenSeleccionada: File | null = null;   // archivo temporal seleccionado por el usuario
  vistaPrevia: string | null = null;        // URL temporal para previsualizar la imagen
  subiendo = false;                         // estado de proceso de guardado

  // Referencia al input de archivos (para abrir el explorador al hacer click en el área)
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private imagenService: ImagenService,
    private estudioService: EstudioService
  ) {}

  ngOnInit(): void {
    // La imagen es opcional; solo validamos el nombre
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
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
    this.imagenService.subirUna(this.imagenSeleccionada).subscribe({
      next: (rutas: string[]) => {
        const imagenUrl = rutas?.[0];
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


