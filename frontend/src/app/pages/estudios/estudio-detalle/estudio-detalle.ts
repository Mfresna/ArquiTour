import { Component } from '@angular/core';
import { EstudioModel } from '../../../models/estudioModel';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { forkJoin, tap } from 'rxjs';
import { ObraService } from '../../../services/obra-service';

@Component({
  selector: 'app-estudio-detalle',
  imports: [RouterLink],
  templateUrl: './estudio-detalle.html',
  styleUrl: './estudio-detalle.css',
})
export class EstudioDetalle { 
  estudio?: EstudioModel;
  cargando = true;
  obrasVinculadas: { id: number; nombre: string }[] = [];

  imagenDefecto = `${environment.imgEstudio}`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudioService: EstudioService,
    private obraService: ObraService,
    private tokenSrv: TokenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/']); return; }

    // this.estudioSrv.getEstudio(id).subscribe({
    //   next: (data) => { this.estudio = data; this.cargando = false; },
    //   error: (e) => this.router.navigate(['/'])
    // });

    this.estudioService.getEstudio(id).subscribe({
    next: (est) => {
      this.estudio = est;
      this.cargando = false;

      const ids = est.obrasIds ?? [];
      this.cargarObrasVinculadasPorIds(ids);
    },
    error: () => this.router.navigate(['/estudios']),
    });
  }

  private cargarObrasVinculadasPorIds(ids: number[]) {
    if (!ids?.length) {
      this.obrasVinculadas = [];
      return;
    }

    // 1) Primer pase: usar cache si hay nombre
    const faltantes: number[] = [];
    this.obrasVinculadas = ids.map(id => {
      const nombre = this.obraService.getNombreById(id);
      if (!nombre) faltantes.push(id);
      return { id, nombre: nombre ?? `#${id}` }; // placeholder hasta resolver
    });

    // 2) Si faltan, pedimos y cacheamos
    if (!faltantes.length) return;

    forkJoin(
      faltantes.map(id =>
        this.obraService.getObra(id).pipe(
          tap(o => this.obraService.cachearNombre(o.id!, o.nombre))
        )
      )
    ).subscribe({
      next: (obras) => {
        const mapa = new Map(obras.map(o => [o.id!, o.nombre]));
        this.obrasVinculadas = this.obrasVinculadas.map(item => ({
          id: item.id,
          nombre: mapa.get(item.id) ?? item.nombre
        }));
      },
      error: () => {
        // si alguna falla, quedan los placeholders #id
      }
    });
  }




  imgSrc(nombre?: string): string {
  if (!nombre) return this.imagenDefecto;

    // Aseguramos que siempre empiece con "/imagen"
    const path = nombre.startsWith('/') ? nombre : `/${nombre}`;

    // Devolvemos la URL completa hacia el backend
    return `${environment.apiUrl}${path}`;
  }

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.imagenDefecto)) return;
    img.src = `${location.origin}/${this.imagenDefecto.replace(/^\/+/, '')}`;
  }

  // Roles
  puedeGestionar(): boolean {
     return this.tokenSrv.isAdmin() || this.tokenSrv.isArquitecto(); 
  }

  editar(): void {
  if (!this.estudio?.id) return;
  this.router.navigate(['/estudios', this.estudio.id, 'editar']);
  }

  eliminar(): void {
    if (!this.estudio?.id) return;
    if (!confirm('¿Eliminar este estudio?')) return;
     alert('Estudio eliminado correctamente.');
    this.estudioService.deleteEstudio(this.estudio.id).subscribe({
      next: () => this.router.navigate(['/estudios']),
      error: (e) => alert('No se pudo eliminar el estudio')
    });
  }

}
