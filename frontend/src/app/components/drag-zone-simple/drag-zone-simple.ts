import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drag-zone-simple',
  imports: [],
  templateUrl: './drag-zone-simple.html',
  styleUrl: './drag-zone-simple.css',
})
export class DragZoneSimple {

  @Input() label: string = 'Imagen';
  @Input() labelBoton: string = 'Quitar imagen';
  @Input() verBoton: boolean = true;
  @Input() imgExistente: string | null = null;

  @Output() archivoChange = new EventEmitter<File | null>();
  @Output() quitadoImg = new EventEmitter<boolean>();

  imagenes: File[] = [];
  vistasPrevias: string[] = [];

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    if (this.imgExistente) {
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

  capturarArchivo(evento: DragEvent | Event): void {
    evento.preventDefault?.();

    let files: FileList | null = null;

    if (evento instanceof DragEvent) files = evento.dataTransfer?.files ?? null;
    else if (evento.target instanceof HTMLInputElement) files = evento.target.files ?? null;

    if (!files?.length) return;

    this.setImagenes([files[0]]);
  }

  private setImagenes(archivos: File[]): void {
    this.vistasPrevias.forEach(url => {
      if (!this.imgExistente || url !== this.imgExistente) URL.revokeObjectURL(url);
    });

    this.imagenes = archivos;
    this.vistasPrevias = archivos.map(a => URL.createObjectURL(a));

    this.archivoChange.emit(this.imagenes[0] ?? null);
    this.quitadoImg.emit(false);
  }

  limpiarImagen(e?: Event): void {
    e?.stopPropagation();

    this.vistasPrevias.forEach(url => {
      if (!this.imgExistente || url !== this.imgExistente) URL.revokeObjectURL(url);
    });

    this.imagenes = [];
    this.vistasPrevias = [];
    this.imgExistente = null;

    if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';

    this.archivoChange.emit(null);
    this.quitadoImg.emit(true);
  }

  obtenerArchivoActual(): File | null {
    return this.imagenes[0] ?? null;
  }
}