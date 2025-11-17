import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drag-zone-multiple',
  imports: [],
  templateUrl: './drag-zone-multiple.html',
  styleUrl: './drag-zone-multiple.css',
})
export class DragZoneMultiple {

  @Input() label: string = 'Imagen';
  @Input() labelBoton: string = 'Quitar imagen';
  @Input() imagenesExistentes: string[] = [];

  @Output() archivosChange = new EventEmitter<File[]>();
  @Output() existentesChange = new EventEmitter<string[]>();

  imagenes: File[] = [];
  vistasPrevias: string[] = [];

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  abrirExplorador(e?: Event): void {
    e?.stopPropagation();
    this.inputArchivo?.nativeElement.click();
  }

  permitirSoltar(evento: DragEvent): void {
    evento.preventDefault();
  }

  capturarArchivo(evento: DragEvent | Event): void {
    evento.preventDefault?.();

    let files: FileList | null = null;

    if (evento instanceof DragEvent) files = evento.dataTransfer?.files ?? null;
    else if (evento.target instanceof HTMLInputElement) files = evento.target.files ?? null;

    if (!files?.length) return;

    const nuevos = Array.from(files);
    this.setImagenes([...this.imagenes, ...nuevos]);
  }

  private setImagenes(archivos: File[]): void {
    this.vistasPrevias.forEach(url => URL.revokeObjectURL(url));

    this.imagenes = archivos;
    this.vistasPrevias = archivos.map(a => URL.createObjectURL(a));

    this.archivosChange.emit(this.imagenes);
  }

  quitarNueva(index: number, e?: Event) {
    e?.stopPropagation();

    URL.revokeObjectURL(this.vistasPrevias[index]);

    this.imagenes.splice(index, 1);
    this.vistasPrevias.splice(index, 1);

    this.archivosChange.emit(this.imagenes);
  }

  quitarExistente(index: number, e?: Event) {
    e?.stopPropagation();

    const nuevas = this.imagenesExistentes.filter((_, i) => i !== index);
    this.imagenesExistentes = nuevas;

    this.existentesChange.emit(nuevas);
  }

  limpiarImagen(e?: Event): void {
    e?.stopPropagation();

    this.vistasPrevias.forEach(url => URL.revokeObjectURL(url));

    this.imagenes = [];
    this.vistasPrevias = [];
    this.imagenesExistentes = [];

    if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';

    this.archivosChange.emit([]);
    this.existentesChange.emit([]);
  }
}