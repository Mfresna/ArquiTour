import { Component } from '@angular/core';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { forkJoin, tap } from 'rxjs';
import { ObraService } from '../../../services/obraService/obra-service';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { UsuarioModel } from '../../../models/usuarioModels/usuarioModel';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';

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

  arquitectosVinculados: { id: number; nombre: string }[] = [];

  imagenDefecto = `${environment.imgEstudio}`;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudioService: EstudioService,
    private usuarioService: UsuarioService,
    private obraService: ObraService,
    private tokenSrv: TokenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.estudioService.getEstudio(id).subscribe({
      next: (est: EstudioModel) => {
        this.estudio = est;
        this.cargando = false;

        // Obras Vinculadas
        const ids = est.obrasIds ?? [];
        this.cargarObrasVinculadasPorIds(ids);

        // Arquitectos vinculados
        const idsArquitectos = est.arquitectosIds ?? [];
        this.cargarArquitectosVinculadosPorIds(idsArquitectos);
      },
      error: () => this.router.navigate(['/estudios']),
    });
  }

  private cargarObrasVinculadasPorIds(ids: number[]): void {
    if (!ids?.length) {
      this.obrasVinculadas = [];
      return;
    }

    // Nombre de Obras
    const faltantes: number[] = [];
    this.obrasVinculadas = ids.map(id => {
      const nombre = this.obraService.getNombreById(id);
      if (!nombre) faltantes.push(id);
      return { id, nombre: nombre ?? `#${id}` }; 
    });

    // Si faltan, pedimos y cacheamos
    if (!faltantes.length) return;

    forkJoin(
      faltantes.map(id =>
        this.obraService.getObra(id).pipe(
          tap((o: ObraModel) =>
            this.obraService.cachearNombre(o.id!, o.nombre)
          )
        )
      )
    ).subscribe({
      next: (obras: ObraModel[]) => {
        const mapa = new Map<number, string>(
          obras.map(o => [o.id!, o.nombre])
        );

        this.obrasVinculadas = this.obrasVinculadas.map(item => ({
          id: item.id,
          nombre: mapa.get(item.id) ?? item.nombre,
        }));
      },
      error: (e) => {
        console.error('No se pudieron obtener algunas obras:', e);
      },
    });
  }

  private cargarArquitectosVinculadosPorIds(ids: number[]): void {
    if (!ids?.length) {
      this.arquitectosVinculados = [];
      return;
    }

    const faltantes: number[] = [];

    this.arquitectosVinculados = ids.map(id => {
      const nombreEnCache = this.usuarioService.getNombreById(id);

      if (!nombreEnCache) {
        faltantes.push(id);
      }

      return {
      id,
      nombre: nombreEnCache ?? `#${id}`,   
      };
    });

    // 2) Si ya tengo todos los nombres en cache
    if (!faltantes.length) return;

    // 3) Pido solo los que faltan
    forkJoin(
      faltantes.map(id =>
        this.usuarioService.getUsuario(String(id)).pipe(
          tap((u: UsuarioModel) => {
            const nombreCompleto = `${u.nombre} ${u.apellido}`.trim();
            this.usuarioService.cachearNombre(u.id!, nombreCompleto);
          })
        )
      )
    ).subscribe({
      next: (usuarios: UsuarioModel[]) => {
        const mapa = new Map<number, string>(
          usuarios.map(u => [u.id!, `${u.nombre} ${u.apellido}`.trim()])
        );

        // 4) Reemplazo placeholders #id por el nombre real
        this.arquitectosVinculados = this.arquitectosVinculados.map(item => ({
          id: item.id,
          nombre: mapa.get(item.id) ?? item.nombre, // si alguno falla, queda #id
        }));
      },
      error: (e) => {
        console.error('No se pudieron obtener algunos arquitectos:', e);
      },
    });
  }

  imgSrc(nombre?: string): string {
    if (!nombre) return this.imagenDefecto;

    const path = nombre.startsWith('/') ? nombre : `/${nombre}`;
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

    this.estudioService.deleteEstudio(this.estudio.id).subscribe({
      next: () => {
        alert('Estudio eliminado correctamente.');
        this.router.navigate(['/estudios']);
      },
      error: () => alert('No se pudo eliminar el estudio'),
    });
  }
}
