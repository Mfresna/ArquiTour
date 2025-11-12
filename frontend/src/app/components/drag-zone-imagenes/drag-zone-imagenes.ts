import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ImagenService } from '../../services/imagenService/imagen-service';

@Component({
  selector: 'app-drag-zone-imagenes',
  imports: [],
  templateUrl: './drag-zone-imagenes.html',
  styleUrl: './drag-zone-imagenes.css',
})
export class DragZoneImagenes implements OnInit{

  @Input() label: string = 'Imagen'
  @Input() labelBoton: string = 'Quitar imagen'
  @Input() imgExistente: string | null = null;

  // Estado relacionado a la imagen
  imagenSeleccionada: File | null = null;   // archivo temporal seleccionado por el usuario
  vistaPrevia: string | null = null;        // URL temporal para previsualizar la imagen
  subiendo = false;                         // estado de proceso de guardado

  // Referencia al input de archivos (para abrir el explorador al hacer click en el área)
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    if(this.imgExistente){
      this.vistaPrevia = this.imgExistente;
    }
  }

  abrirExplorador(e?: Event): void {
    if (e){
      //frena la propagacion del click en otros elementos
      e.stopPropagation();  
    }        

    if (!this.vistaPrevia){
      this.inputArchivo?.nativeElement.click();
    }    
  }

  // ===================== SELECCIONAR EL ARCHIVO
  capturarArchivo(evento: DragEvent | Event): void {
    evento.preventDefault?.();
    let archivo: File | null = null;

    if (evento instanceof DragEvent) {
      //input de dragzone
      archivo = evento.dataTransfer?.files?.[0] ?? null;
    } else if (evento.target instanceof HTMLInputElement) {
      //input desde explorador de archivos
      archivo = evento.target.files?.[0] ?? null;
    }

    if (archivo) {
      this.setArchivoSeleccionado(archivo);
    }
  }

  private setArchivoSeleccionado(archivo: File): void {
    this.imagenSeleccionada = archivo;

    // limpiar vista previa previa (si existe) y generar una nueva
    if (this.vistaPrevia) URL.revokeObjectURL(this.vistaPrevia);
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  permitirSoltar(evento: DragEvent): void {
    evento.preventDefault();
  }

  limpiarImagen(e?: Event): void {

    e?.stopPropagation();

    this.imagenSeleccionada = null;

    if (this.vistaPrevia) {
      URL.revokeObjectURL(this.vistaPrevia);
      this.vistaPrevia = null;
    }
    if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';
  }

  obtenerArchivoActual(): File | null {
    return this.imagenSeleccionada;
  }

}
