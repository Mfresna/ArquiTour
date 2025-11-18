import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { finalize, forkJoin, switchMap, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DragZoneSimple } from '../../../components/drag-zone-simple/drag-zone-simple';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { UsuarioModel } from '../../../models/usuarioModels/usuarioModel';

@Component({
  selector: 'app-estudio-form',
  imports: [ReactiveFormsModule, DragZoneSimple],
  templateUrl: './estudio-form.html',
  styleUrl: './estudio-form.css',
})
export class EstudioForm {
  formulario!: FormGroup;
  id?: number;
  imagenActualUrl: string | null = null;
  imagenDefecto = `${environment.imgEstudio}`;
  editar = false;
  subiendo = false;  
  archivoSeleccionado: File | null = null;
  imagenUrlExistente = false;
  quitadoImg: boolean = false;
  mensajeErrorAgregar: string | null = null;
  arquitectosVinculados: { id: number; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private imagenService: ImagenService,
    private estudioService: EstudioService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    // La imagen es opcional, solo validamos el nombre
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],

      obrasIds: this.fb.control<number[]>([]),
      arquitectosIds: this.fb.control<number[]>([]),
      emailArquitecto: ['', [Validators.email]]
      
    });

    const idParam = this.route.snapshot.params['id'];
      if (idParam) {
      this.editar = true;
      this.id = Number(idParam);
      this.cargarEstudio(this.id);
      }
  }

  private cargarEstudio(id: number): void {
    this.mensajeErrorAgregar = null;

    this.estudioService.getEstudio(id).pipe(take(1)).subscribe({
      next: (data) => {
        this.formulario.patchValue({ 
          nombre: data.nombre, 
          obrasIds: data.obrasIds ?? [],
          arquitectosIds: data.arquitectosIds ?? []
        });

        const idsArquitectos = data.arquitectosIds ?? [];
        this.cargarArquitectosVinculadosPorIds(idsArquitectos);
        
        if (data.imagenUrl && !this.esImagenPorDefecto(data.imagenUrl)) {
          const path = data.imagenUrl.startsWith('/') ? data.imagenUrl : `/${data.imagenUrl}`;
          this.imagenActualUrl = `${environment.apiUrl}${path}`;

          this.imagenUrlExistente = true;
          this.quitadoImg = false;

        } else {
          // si no tiene propia o es la default -> drag vacío
          this.imagenActualUrl = null;
          this.imagenUrlExistente = false;
          this.quitadoImg = false;
        }
      },
      error: () => alert('No se pudo cargar el estudio.'),
    });
  }

  private esImagenPorDefecto(imagenUrl: string): boolean {

    const soloPath = imagenUrl.replace(/^https?:\/\/[^/]+/, ''); 

    const defNormalizada = this.imagenDefecto.startsWith('/')
      ? this.imagenDefecto
      : `/${this.imagenDefecto}`;

    return soloPath === defNormalizada;
  }


  guardar(event?: Event): void {
    event?.preventDefault();

    const nombre = (this.formulario.get('nombre')?.value ?? '').trim();
    if (!nombre) {
      alert('Debe ingresar un nombre válido.');
      return;
    }
    

    this.subiendo = true;
    const archivo = this.archivoSeleccionado;

    if (this.editar && this.id != null) {
      this.guardarEdicion(nombre, archivo);
    } else {
      this.guardarCreacion(nombre, archivo);
    }
  }

  /* ===================== EDICIÓN ===================== */

  private guardarEdicion(nombre: string, archivo: File | null): void {
    
    const updatePayload: EstudioModel = this.buildUpdatePayload(nombre);

    const tieneImagenOriginal = !!this.imagenUrlExistente;

    // CASO 1: Tenía imagen, la quitó y NO subió otra
    if (tieneImagenOriginal && this.quitadoImg && !archivo) {
      this.estudioService.updateImagenPerfil(this.id!, null).pipe(
        switchMap(() => this.estudioService.updateEstudio(updatePayload)),
        finalize(() => this.subiendo = false)
      ).subscribe({
        next: () => this.onUpdateSuccess(false),
        error: () => this.onUpdateError()
      });
      return;
    }

    // CASO 2: No tocó la imagen y no hay archivo nuevo
    if (!archivo) {
      this.estudioService.updateEstudio(updatePayload).pipe(
        finalize(() => this.subiendo = false)
      ).subscribe({
        next: () => this.onUpdateSuccess(false),
        error: () => this.onUpdateError()
      });
      return;
    }

    // CASO 3: Hay archivo nuevo
    this.imagenService.subirUna(archivo).pipe(
      take(1),
      switchMap(rutas => {
        const imagenUrl = rutas?.[0];
        if (!imagenUrl) throw new Error('Sin URL de imagen');
        return this.estudioService.updateImagenPerfil(this.id!, imagenUrl);
      }),
      switchMap(() => this.estudioService.updateEstudio(updatePayload)),
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => this.onUpdateSuccess(true),
      error: () => this.onUpdateError()
    });
  }

  private buildUpdatePayload(nombre: string): EstudioModel {
    const obrasIds: number[] = this.formulario.get('obrasIds')?.value ?? [];
    const arquitectosIds: number[] = this.formulario.get('arquitectosIds')?.value ?? [];

    return {
      id: this.id!,
      nombre,
      ...(obrasIds.length ? { obrasIds } : {}),
      ...(arquitectosIds.length ? { arquitectosIds } : {}),
    };
  }

  private onUpdateSuccess(resetArchivo: boolean): void {
    if (resetArchivo) {
      this.archivoSeleccionado = null;
    }
    this.router.navigate(['/estudios', this.id]);
  }

  private onUpdateError(): void {
    alert('No se pudo actualizar.');
  }

  /* ===================== CREACIÓN ===================== */

  private guardarCreacion(nombre: string, archivo: File | null): void {
    // Sin imagen
    if (!archivo) {
      this.estudioService.postEstudio({ nombre }).pipe(
        finalize(() => this.subiendo = false)
      ).subscribe({
        next: () => this.onCreateSuccess(),
        error: () => alert('No se pudo crear el estudio.')
      });
      return;
    }

    // Con imagen
    this.imagenService.subirUna(archivo).pipe(
      take(1),
      switchMap(rutas => {
        const imagenUrl = rutas?.[0];
        if (!imagenUrl) {
          throw new Error('Sin URL de imagen');
        }
        return this.estudioService.postEstudio({ nombre, imagenUrl });
      }),
      finalize(() => this.subiendo = false)
    ).subscribe({
      next: () => this.onCreateSuccess(),
      error: () => alert('No se pudo crear el estudio.')
    });
  }

  private onCreateSuccess(): void {
    this.formulario.reset();
    this.archivoSeleccionado = null;
    alert('Estudio creado');
    this.router.navigate(['/estudios']);
  }

  /* ===================== OTROS MÉTODOS ===================== */

  imagenError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.includes(this.imagenDefecto)) return; // evita loop
    img.src = this.imagenDefecto;
  }

  /* ===================== GESTIÓN ARQUITECTO ===================== */

  quitarArquitecto(arqId: number): void {
    if (!this.editar || !this.id) return;
    if (!confirm('¿Quitar este arquitecto del estudio?')) return;

    this.estudioService.eliminarArquitecto(this.id, arqId).pipe(take(1)).subscribe({
      next: (estudioActualizado) => {
        if (estudioActualizado && Array.isArray(estudioActualizado.arquitectosIds)) {
          this.formulario.get('arquitectosIds')?.setValue(estudioActualizado.arquitectosIds);
        } else {
          const actuales = (this.formulario.get('arquitectosIds')?.value ?? []) as number[];
          this.formulario.get('arquitectosIds')?.setValue(actuales.filter(x => x !== arqId));
        }
        this.arquitectosVinculados = this.arquitectosVinculados.filter(a => a.id !== arqId);
      },
      error: () => alert('No se pudo quitar el arquitecto'),
    });
  }

  agregarArquitectoPorEmail(): void {
    this.mensajeErrorAgregar = null;

    const control = this.formulario.get('emailArquitecto');
    const email = (control?.value ?? '').trim().toLowerCase();

    // 1) Si está vacío → mensaje "Debe ingresar un email"
    if (!email) {
      this.mensajeErrorAgregar = 'Debe ingresar un email.';
      return;
    }

    // 2) Si el formato es inválido 
    if (control?.invalid) {
      control.markAsTouched();      
      this.mensajeErrorAgregar = null; 
      return;
    }

    // 3) Email válido 
    this.usuarioService
      .getUsuarios(undefined, undefined, email)
      .pipe(take(1))
      .subscribe({
        next: usuarios => {

          const usuario = usuarios.find(
            u => u.email?.toLowerCase() === email
          );

          if (!usuario) {
            this.mensajeErrorAgregar = 'Usuario no registrado en la base de datos.';
            return;
          }

          const arquitectoId = usuario.id;
          if (!arquitectoId) {
            this.mensajeErrorAgregar = 'No se pudo obtener el ID del usuario.';
            return;
          }

          const actuales: number[] =
            this.formulario.get('arquitectosIds')?.value ?? [];

          if (actuales.includes(arquitectoId)) {
            this.mensajeErrorAgregar = 'Este arquitecto ya forma parte del estudio.';
            return;
          }

          this.estudioService
            .agregarArquitecto(this.id!, arquitectoId)
            .pipe(take(1))
            .subscribe({
              next: estudioActualizado => {
                const nuevosIds = Array.isArray(estudioActualizado?.arquitectosIds)
                  ? estudioActualizado.arquitectosIds
                  : [...actuales, arquitectoId];

                this.formulario.get('arquitectosIds')?.setValue(nuevosIds);

                // actualizar lista con nombres 
                const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
                this.usuarioService.cachearNombre(arquitectoId, nombreCompleto);

                if (!this.arquitectosVinculados.some(a => a.id === arquitectoId)) {
                  this.arquitectosVinculados = [
                    ...this.arquitectosVinculados,
                    { id: arquitectoId, nombre: nombreCompleto || `#${arquitectoId}` }
                  ];
                }

                control?.reset();
                this.mensajeErrorAgregar = null;

              },

              error: (e) => {
                if (e.status === 404) {
                  this.mensajeErrorAgregar = 'Usuario no registrado en la base de datos.';
                } else if (e.status === 409) {
                  this.mensajeErrorAgregar = 'El usuario existe pero su cuenta está inhabilitada.';
                } else if (e.status === 422) {
                  this.mensajeErrorAgregar = 'El usuario no tiene el rol de Arquitecto.';
                } else if (e.status === 400) {
                  this.mensajeErrorAgregar = 'Este arquitecto ya forma parte del estudio.';
                } else {
                  this.mensajeErrorAgregar = 'No se pudo agregar el arquitecto al estudio.';
                }
              },
            });
        },

        error: () => {
          this.mensajeErrorAgregar = 'Error al buscar el usuario por email.';
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

    if (!faltantes.length) return;

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

        this.arquitectosVinculados = this.arquitectosVinculados.map(item => ({
          id: item.id,
          nombre: mapa.get(item.id) ?? item.nombre,
        }));
      },
      error: (e) => {
        console.error('No se pudieron obtener algunos arquitectos:', e);
      },
    });
  }

}
  
 