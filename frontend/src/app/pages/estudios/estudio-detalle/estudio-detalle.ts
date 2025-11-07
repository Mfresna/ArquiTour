import { Component } from '@angular/core';
import { EstudioModel } from '../../../models/estudioModel';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../auth/services/tokenService/token-service';
import { EstudioService } from '../../../services/estudioService/estudio-service';

@Component({
  selector: 'app-estudio-detalle',
  imports: [],
  templateUrl: './estudio-detalle.html',
  styleUrl: './estudio-detalle.css',
})
export class EstudioDetalle {
  estudio?: EstudioModel;
  cargando = true;
  readonly fallback = 'assets/img/descarga.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudioSrv: EstudioService,
    private tokenSrv: TokenService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/']); return; }

    this.estudioSrv.getEstudio(id).subscribe({
      next: (data) => { this.estudio = data; this.cargando = false; },
      error: (e) => this.router.navigate(['/'])
    });
  }

  imgSrc(nombre?: string): string {
  if (!nombre) return this.fallback;

    // Aseguramos que siempre empiece con "/imagen"
    const path = nombre.startsWith('/') ? nombre : `/${nombre}`;

    // Devolvemos la URL completa hacia el backend
    return `${environment.apiUrl}${path}`;
  }



  onImgError(ev: Event): void {
    const img = ev.target as HTMLImageElement;
    if (img.src.includes(this.fallback)) return;
    img.src = `${location.origin}/${this.fallback.replace(/^\/+/, '')}`;
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
    this.estudioSrv.deleteEstudio(this.estudio.id).subscribe({
      next: _ => this.router.navigate(['/estudios']),
      error: _ => alert('No se pudo eliminar el estudio')
    });
  }

}
