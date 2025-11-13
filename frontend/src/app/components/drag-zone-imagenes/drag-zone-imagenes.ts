import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ImagenService } from '../../services/imagenService/imagen-service';

@Component({
  selector: 'app-drag-zone-imagenes',
  imports: [],
  templateUrl: './drag-zone-imagenes.html',
  styleUrl: './drag-zone-imagenes.css',
})
// export class DragZoneImagenes implements OnInit{

//   @Input() label: string = 'Imagen'
//   @Input() labelBoton: string = 'Quitar imagen'
//   @Input() imgExistente: string | null = null;
//   @Output() archivoChange = new EventEmitter<File | null>();

//   // Estado relacionado a la imagen
//   imagenSeleccionada: File | null = null;   // archivo temporal seleccionado por el usuario
//   vistaPrevia: string | null = null;        // URL temporal para previsualizar la imagen
//   subiendo = false;                         // estado de proceso de guardado

//   // Referencia al input de archivos (para abrir el explorador al hacer click en el área)
//   @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

//   ngOnInit(): void {
//     if(this.imgExistente){
//       this.vistaPrevia = this.imgExistente;
//     }
//   }
  

//   abrirExplorador(e?: Event): void {
//     if (e){
//       //frena la propagacion del click en otros elementos
//       e.stopPropagation();  
//     }        

//     if (!this.vistaPrevia){
//       this.inputArchivo?.nativeElement.click();
//     }    
//   }

//   // ===================== SELECCIONAR EL ARCHIVO
//   capturarArchivo(evento: DragEvent | Event): void {
//     evento.preventDefault?.();
//     let archivo: File | null = null;

//     if (evento instanceof DragEvent) {
//       //input de dragzone
//       archivo = evento.dataTransfer?.files?.[0] ?? null;
//     } else if (evento.target instanceof HTMLInputElement) {
//       //input desde explorador de archivos
//       archivo = evento.target.files?.[0] ?? null;
//     }

//     if (archivo) {
//       this.setArchivoSeleccionado(archivo);
//     }
//   }

//   private setArchivoSeleccionado(archivo: File): void {
//     this.imagenSeleccionada = archivo;

//     // limpiar vista previa previa (si existe) y generar una nueva
//     if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
//     this.vistaPrevia = URL.createObjectURL(archivo);
//     this.archivoChange.emit(archivo);
//   }

//   permitirSoltar(evento: DragEvent): void {
//     evento.preventDefault();
//   }

//   limpiarImagen(e?: Event): void {

//     e?.stopPropagation();

//     this.imagenSeleccionada = null;

//     if (this.vistaPrevia) {
//       URL.revokeObjectURL(this.vistaPrevia);
//       this.vistaPrevia = null;
//     }
//     if (this.inputArchivo) {
//       this.inputArchivo.nativeElement.value = '';
//       this.archivoChange.emit(null);
//     }
//   }

//   obtenerArchivoActual(): File | null {
//     return this.imagenSeleccionada;
//   }

// }


export class DragZoneImagenes implements OnInit {

  @Input() label: string = 'Imagen';
  @Input() labelBoton: string = 'Quitar imagen';
  @Input() imgExistente: string | null = null;

  // 🔹 NUEVO: permite modo múltiple
  @Input() multiple: boolean = false;

  // 🔹 Para compatibilidad con tu código actual (1 imagen)
  @Output() archivoChange = new EventEmitter<File | null>();

  // 🔹 NUEVO: cuando querés manejar varias
  @Output() archivosChange = new EventEmitter<File[]>();

  // Estado interno
  imagenes: File[] = [];        // una o muchas
  vistasPrevias: string[] = []; // urls para previsualizar
  subiendo = false;

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    // Si es modo single y viene una imagen del back, la mostramos
    if (!this.multiple && this.imgExistente) {
      // la tratamos como "preview inicial"
      this.vistasPrevias = [this.imgExistente];
    }
  }

  abrirExplorador(e?: Event): void {
    e?.stopPropagation();
    this.inputArchivo?.nativeElement.click();
  }

  permitirSoltar(evento: DragEvent): void {
    evento.preventDefault();
  }

  // ===================== SELECCIONAR ARCHIVO(S)
  capturarArchivo(evento: DragEvent | Event): void {
    evento.preventDefault?.();

    let files: FileList | null = null;

    if (evento instanceof DragEvent) {
      files = evento.dataTransfer?.files ?? null;
    } else if (evento.target instanceof HTMLInputElement) {
      files = evento.target.files ?? null;
    }

    if (!files?.length) return;

    const nuevos = Array.from(files);

    if (this.multiple) {
      // modo multi: acumulamos
      const combinados = [...this.imagenes, ...nuevos];
      this.setImagenes(combinados);
    } else {
      // modo single: nos quedamos solo con la primera
      this.setImagenes([nuevos[0]]);
    }
  }

  private setImagenes(archivos: File[]): void {
    // limpiamos objectURLs anteriores (si no vienen del back)
    this.vistasPrevias.forEach(url => {
      if (!this.imgExistente || url !== this.imgExistente) {
        URL.revokeObjectURL(url);
      }
    });

    this.imagenes = archivos;
    this.vistasPrevias = archivos.map(a => URL.createObjectURL(a));

    // Emitimos según el modo
    if (this.multiple) {
      this.archivosChange.emit(this.imagenes);
    } else {
      this.archivoChange.emit(this.imagenes[0] ?? null);
    }
  }

  // Quitar una imagen (modo múltiple)
  quitarImagen(index: number, e?: Event): void {
    e?.stopPropagation();

    const nuevas = [...this.imagenes];
    const nuevasPrev = [...this.vistasPrevias];

    const url = nuevasPrev[index];
    if (url && (!this.imgExistente || url !== this.imgExistente)) {
      URL.revokeObjectURL(url);
    }

    nuevas.splice(index, 1);
    nuevasPrev.splice(index, 1);

    this.imagenes = nuevas;
    this.vistasPrevias = nuevasPrev;

    if (this.multiple) {
      this.archivosChange.emit(this.imagenes);
    } else {
      this.archivoChange.emit(this.imagenes[0] ?? null);
    }
  }

  // Quitar todo (single o multi)
  limpiarImagen(e?: Event): void {
    e?.stopPropagation();

    this.imagenes = [];
    this.vistasPrevias.forEach(url => {
      if (!this.imgExistente || url !== this.imgExistente) {
        URL.revokeObjectURL(url);
      }
    });

    this.vistasPrevias = [];
    this.imgExistente = null;

    if (this.inputArchivo) {
      this.inputArchivo.nativeElement.value = '';
    }

    if (this.multiple) {
      this.archivosChange.emit([]);
    } else {
      this.archivoChange.emit(null);
    }
  }

  // helper para el modo single (si querés)
  obtenerArchivoActual(): File | null {
    return this.imagenes[0] ?? null;
  }
}