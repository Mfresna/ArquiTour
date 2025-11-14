import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-drag-zone-imagenes',
  imports: [],
  templateUrl: './drag-zone-imagenes.html',
  styleUrl: './drag-zone-imagenes.css',
})

export class DragZoneImagenes implements OnInit {

  @Input() label: string = 'Imagen';
  @Input() labelBoton: string = 'Quitar imagen';
  @Input() imgExistente: string | null = null;
  @Input() multiple: boolean = false;
  @Input() imagenesExistentes: string[] = [];
  
  @Output() archivoChange = new EventEmitter<File | null>();
  @Output() archivosChange = new EventEmitter<File[]>();
  @Output() existentesChange = new EventEmitter<string[]>();

  imagenes: File[] = [];       // nuevas
  vistasPrevias: string[] = []; // previews de nuevas

  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    if (!this.multiple && this.imgExistente) {
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

    if (evento instanceof DragEvent) {
      files = evento.dataTransfer?.files ?? null;
    } else if (evento.target instanceof HTMLInputElement) {
      files = evento.target.files ?? null;
    }

    if (!files?.length) return;

    const nuevos = Array.from(files);

    if (this.multiple) {
      const combinados = [...this.imagenes, ...nuevos];
      this.setImagenes(combinados);
    } else {
      this.setImagenes([nuevos[0]]);
    }
  }

  private setImagenes(archivos: File[]): void {
    this.vistasPrevias.forEach(url => {
      if (!this.imgExistente || url !== this.imgExistente) {
        URL.revokeObjectURL(url);
      }
    });

    this.imagenes = archivos;
    this.vistasPrevias = archivos.map(a => URL.createObjectURL(a));

    if (this.multiple) {
      this.archivosChange.emit(this.imagenes);
    } else {
      this.archivoChange.emit(this.imagenes[0] ?? null);
    }
  }

  // quitar nueva
  quitarNueva(index: number, e?: Event) {
    e?.stopPropagation();

    const url = this.vistasPrevias[index];
    URL.revokeObjectURL(url);

    this.imagenes.splice(index, 1);
    this.vistasPrevias.splice(index, 1);

    this.archivosChange.emit(this.imagenes);
  }

  // quitar existente (urls del back)
  quitarExistente(index: number, e?: Event) {
    e?.stopPropagation();

    const nuevas = this.imagenesExistentes.filter((_, i) => i !== index);
    
    this.imagenesExistentes = nuevas;
    this.existentesChange.emit(nuevas);
  }

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
    this.imagenesExistentes = [];

    if (this.inputArchivo) {
      this.inputArchivo.nativeElement.value = '';
    }

    if (this.multiple) {
      this.archivosChange.emit([]);
      this.existentesChange.emit([]);
    } else {
      this.archivoChange.emit(null);
    }
  }

  obtenerArchivoActual(): File | null {
    return this.imagenes[0] ?? null;
  }


}

