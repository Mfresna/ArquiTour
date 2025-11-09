import { Component } from '@angular/core';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { environment } from '../../../../environments/environment';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObraService } from '../../../services/obra-service';
import { CategoriaObraModel } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraModel } from '../../../models/obraModels/estadoObraModel';

@Component({
  selector: 'app-obras',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './obras.html',
  styleUrl: './obras.css',
})
export class Obras {

  obras!: ObraModel[];

  imagenDefecto = `${environment.imgObra}`;

  categorias = Object.values(CategoriaObraModel);
  estados = Object.values(EstadoObraModel);

  filtro!: FormGroup; 

  constructor(
    private fb: FormBuilder,
    private obraService: ObraService
  ) {}

  ngOnInit(): void {
    this.filtro = this.fb.group({
      categoria: [''],
      estado: [''],
      estudioId: [null, [Validators.min(1)]],
    });
    this.cargarObras();
  }

  imagenUrl(urls?: string[]): string {
    if (!urls || urls.length === 0) return this.imagenDefecto;
    const primera = urls[0];
    return `${environment.apiUrl}${primera}`;
  }

  imagenError(ev: Event): void {
  const img = ev.target as HTMLImageElement;
  if (img.src.includes(this.imagenDefecto)) return;
  img.src = this.imagenDefecto;
}

cargarObras(): void {
  //Si se selecciona algo de estado o categoría del select: usa el valor.
  //Si está vacío: se vuelve undefined (y no se manda).
  const categoria = (this.filtro.value.categoria || undefined);
  const estado    = (this.filtro.value.estado || undefined);

  const estudioIdRaw = this.filtro.value.estudioId;
  const estudioId =
    estudioIdRaw !== null && estudioIdRaw !== '' ? Number(estudioIdRaw) : undefined;

  this.obraService.getFiltrarObras(categoria, estado, estudioId).subscribe({
    next: lista => this.obras = lista,
    error: () => alert('No se pudo cargar la lista de obras'),
  });
}



}
