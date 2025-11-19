import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take, finalize, switchMap, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoriaObraModel, CategoriaObraDescripcion } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraModel, EstadoObraDescripcion } from '../../../models/obraModels/estadoObraModel';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { ObraService } from '../../../services/obraService/obra-service';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { DragZoneMultiple } from '../../../components/drag-zone-multiple/drag-zone-multiple';
import { TieneCambiosPendientes } from '../../../guards/salirSinGuardar/salir-sin-guardar-guard';
import { estudioNombreValidador, obraNombreValidador } from '../../../validadores/nombresValidador';
import { noBlancoEspacios } from '../../../validadores/sinEspacioValidador';
import { anioEstadoObra } from '../../../auth/validadores/fechaValidador';
import { MensajeModal, MessageType } from '../../../components/mensaje-modal/mensaje-modal';

@Component({
  selector: 'app-obra-form',
  imports: [ReactiveFormsModule, DragZoneMultiple, MensajeModal],
  templateUrl: './obra-form.html',
  styleUrl: './obra-form.css',
})
export class ObraForm implements TieneCambiosPendientes{
  formulario!: FormGroup;
  editar = false;
  id?: number;

  omitirGuard = false;

  imagenActualUrl: string | null = null;
  imagenDefecto = `${environment.imgObra}`;

  // Nuevas imágenes que vienen del drag-zone
  archivosSeleccionados: File[] = [];

  // Imágenes que ya existen en la obra
  imagenesExistentes: string[] = [];

  subiendo = false;

  categorias = Object.values(CategoriaObraModel);
  estados    = Object.values(EstadoObraModel);
  CategoriaObraDescripcion = CategoriaObraDescripcion;
  EstadoObraDescripcion    = EstadoObraDescripcion;

  estudios: EstudioModel[] = [];

  // ===== MODAL =====
  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: MessageType = 'info';
  redirigirDespues = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private imagenService: ImagenService,
    private obraService: ObraService,
    private estudioService: EstudioService,
  ) {}

  tieneCambiosPendientes(): boolean {
    if (this.omitirGuard) {
      return false;
  }

  return this.formulario?.dirty ?? false;
}

  ngOnInit(): void {
    this.formulario = this.fb.group(
      {
        nombre: ['', [
          Validators.required, 
          Validators.minLength(2),
          Validators.maxLength(100),
          obraNombreValidador
        ]],
        categoria: ['', [Validators.required]],
        estado:    ['', [Validators.required]],
        estudioId: ['', [Validators.required]],
        anioEstado: ['', [
          Validators.required,
          anioEstadoObra
        ]],
        latitud: ['', [
          Validators.required,
          Validators.min(-90),
          Validators.max(90)
        ]],
        longitud: ['', [
          Validators.required,
          Validators.min(-180),
          Validators.max(180)
        ]],
        descripcion: ['', [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\-_\!¡¿&=\+\"\?\s\.,]+$/),
          noBlancoEspacios
        ]],
      }
      
    );

    this.normalizarComaEnControl('latitud');
    this.normalizarComaEnControl('longitud');

    this.cargarEstudios();

    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.editar = true;
      this.id = Number(idParam);
      this.cargarObra(this.id);
    }
  }

  private normalizarComaEnControl(nombreControl: string): void {
  const control = this.formulario.get(nombreControl);
  if (!control) return;

  control.valueChanges.subscribe(rawValue => {
    if (rawValue === null || rawValue === undefined) return;

    const str = String(rawValue);
    if (!str.includes(',')) return;

    const normalizado = str.replace(/,/g, '.');
    const num = Number(normalizado);

    control.setValue(
      isNaN(num) ? normalizado : num,
      { emitEvent: false } 
    );
  });
}

  // ============ MODAL ============
  private mostrarModal(
    titulo: string,
    mensaje: string,
    tipo: MessageType = 'info',
    redirigir: boolean = false
  ): void {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;
    this.redirigirDespues = redirigir;
  }

  onModalAceptar(): void {
    this.modalVisible = false;

    if (this.redirigirDespues) {
      // navegación sin preguntar el guard
      this.omitirGuard = true;

      if (this.editar && this.id != null) {
        this.router.navigate(['/obras', this.id]);
      } else {
        this.router.navigate(['/obras']);
      }
    }

    this.redirigirDespues = false;
  }

  onModalCerrado(): void {
    this.modalVisible = false;
    this.redirigirDespues = false;
  }

  // ==================== AUXILIARES ====================

  // Trae estudios para mostrar en el select
  private cargarEstudios(): void {
    this.estudioService.getFiltrarEstudios().subscribe({
      next: lista => {
        this.estudios = lista ?? [];

        // Cachear todos los nombres para usarlos desde cualquier componente
        for (const e of this.estudios) {
          if (e.id && e.nombre) {
            this.estudioService.cachearNombre(e.id, e.nombre);
          }
        }
      },
      error: () => alert('No se pudieron cargar los estudios'),//VVERRRRRR
    });
  }

  // Traduce estado y categoria en modo edición
  private extraerCodigoCategoria(c: any): CategoriaObraModel | '' {
    if (!c) return '';
    return (typeof c === 'string' ? c : c.codigo ?? '') as CategoriaObraModel | '';
  }

  private extraerCodigoEstado(e: any): EstadoObraModel | '' {
    if (!e) return '';
    return (typeof e === 'string' ? e : e.codigo ?? '') as EstadoObraModel | '';
  }

  // Pasa de URL absoluta a ruta relativa tipo 
  private aRutaRelativa(urlCompleta: string): string {
    const base = environment.apiUrl.replace(/\/+$/, ''); 
    let relativa = urlCompleta;

    if (relativa.startsWith(base)) {
      relativa = relativa.substring(base.length);
    }
    if (!relativa.startsWith('/')) {
      relativa = '/' + relativa;
    }
    return relativa;
  }

  // Carga obra en modo edición
  private cargarObra(id: number): void {
    this.obraService.getObra(id).pipe(take(1)).subscribe({
      next: (obra) => {
        this.formulario.patchValue({
          nombre: obra.nombre ?? '',
          categoria: this.extraerCodigoCategoria(obra.categoria),
          estado:    this.extraerCodigoEstado(obra.estado),
          estudioId: obra.estudioId ?? '',
          anioEstado: obra.anioEstado ?? '',
          latitud: obra.latitud ?? '',
          longitud: obra.longitud ?? '',
          descripcion: obra.descripcion ?? '',
        });

        if (obra.urlsImagenes?.length) {
          // Guardamos las urls como absolutas para el drag-zone
          this.imagenesExistentes = obra.urlsImagenes.map(img => {
            const path = img.startsWith('/') ? img : `/${img}`;
            return `${environment.apiUrl}${path}`;
          });

          // Primera como "portada"
          const img = obra.urlsImagenes[0];
          const path = img.startsWith('/') ? img : `/${img}`;
          this.imagenActualUrl = `${environment.apiUrl}${path}`;
        } else {
          this.imagenActualUrl = this.imagenDefecto;
          this.imagenesExistentes = [];
        }

      },
      error: (e) => {
    
        console.error(e);

        if(e.status === 404){
          this.mostrarModal(
            'Obra no encontrada',
            'La obra que intenta editar no existe o fue eliminada.',
            'warning',
            true
          );
        }else if(e.status ===  401){
          this.mostrarModal(
            'Sin permisos',
            'No puede gestionar obras de estudios a los que no pertenece.',
            'error',
            true
          );
        }else if(e.status === 406){
          this.mostrarModal(
            'Error del servidor',
            'Ocurrió un error al cargar la obra. Intente nuevamente más tarde.',
            'error',
            true
          );
        }else if(e.status >= 500){
          alert("Error de servidor")
        }else{
           this.mostrarModal(
            'Error al cargar',
            'No se pudo cargar la obra.',
            'error',
            true
          );
        }

      }
    });
  }

  // ==================== GUARDAR ====================

  guardar(event?: Event): void {
    event?.preventDefault();

    const nombre = (this.formulario.get('nombre')?.value ?? '').trim();
    if (!nombre) {
      alert('Debe ingresar un nombre válido.');
      return;
    }

    const categoria   = this.formulario.get('categoria')?.value as CategoriaObraModel;
    const estado      = this.formulario.get('estado')?.value as EstadoObraModel;
    const estudioId   = Number(this.formulario.get('estudioId')?.value ?? NaN);
    const anioEstado  = Number(this.formulario.get('anioEstado')?.value ?? NaN);
    const latitud     = Number(this.formulario.get('latitud')?.value ?? NaN);
    const longitud    = Number(this.formulario.get('longitud')?.value );
    const descripcion = (this.formulario.get('descripcion')?.value ?? '').trim();

    this.subiendo = true;
    const archivos = this.archivosSeleccionados;

    // ==================== EDICIÓN ====================
    if (this.editar && this.id != null) {
      const modificarObra: ObraModel = {
        id: this.id,
        nombre,
        categoria,
        estado,
        estudioId,
        anioEstado,
        latitud,
        longitud,
        descripcion,
      };

      // URLs existentes que quedaron después de borrar (las pasamos a relativas)
      const urlsExistentesRel = this.imagenesExistentes.map(u => this.aRutaRelativa(u));

      // Sin nuevas imágenes: actualizo con las existentes (pueden ser 0 y queda sin imágenes)
      if (!archivos.length) {

          // si no quedaron imágenes, no permitimos guardar
        if (urlsExistentesRel.length === 0) {
          this.subiendo = false;
          this.mostrarModal(
            'Imagen requerida',
            'La obra debe tener al menos una imagen.',
            'warning'
          );
          return;
        }
    
        this.obraService.updateObra({
          ...modificarObra,
          urlsImagenes: urlsExistentesRel,
        })
          .pipe(finalize(() => this.subiendo = false))
          .subscribe({
            next: () => {
              this.omitirGuard = true;   
              this.mostrarModal(
                'Obra actualizada',
                'Los datos de la obra se guardaron correctamente.',
                'success',
                true
              );
            },
            error: (e) =>{

              console.error(e);

              if(e.status === 404){
                this.mostrarModal(
                  'Error al actualizar',
                  'No se pudo actualizar la obra.',
                  'error'
                  );
              }else{
                  this.mostrarModal(
                    'Error al actualizar',
                    'No se pudo actualizar la obra.',
                    'error'
                  );
              }

            }
          });
        return;
      }

      // Con nuevas imágenes
      const archivosSubir = archivos.map(file =>
        this.imagenService.subirUna(file).pipe(take(1))
      );

      forkJoin(archivosSubir).pipe(
        switchMap(rutasArray => {
          const urlsNuevas = rutasArray
            .map(r => r?.[0])
            .filter((u): u is string => !!u);

          if (!urlsNuevas.length && !urlsExistentesRel.length) {
            throw new Error('Sin URLs de imágenes');
          }

          const todas = [...urlsExistentesRel, ...urlsNuevas];

          return this.obraService.updateObra({
            ...modificarObra,
            urlsImagenes: todas
          });
        }),
        finalize(() => this.subiendo = false)
      ).subscribe({
        next: () => {
          this.archivosSeleccionados = [];
          this.omitirGuard = true;
          this.mostrarModal(
            'Obra actualizada',
            'Los datos de la obra se guardaron correctamente.',
            'success',
            true
          );
        },
        error: (e) => {
          console.error(e);
          this.mostrarModal(
            'Error al actualizar',
            'No se pudo actualizar la obra.',
            'error'
          );
        }
      });

      return;
    }

    // ==================== CREACIÓN ====================
    const crearObra: ObraModel = {
      nombre,
      categoria,
      estado,
      estudioId,
      anioEstado,
      latitud,
      longitud,
      descripcion,
    };

    if (!archivos.length) {
      this.subiendo = false;
      this.mostrarModal(
        'Imagen requerida',
        'Debe cargar al menos una imagen para la obra.',
        'warning'
      );
      return;
    }

    const archivosSubir = archivos.map(file =>
      this.imagenService.subirUna(file).pipe(take(1))
    );

    forkJoin(archivosSubir).subscribe({
      next: rutasArray => {
        const urls = rutasArray
          .map(r => r?.[0])
          .filter((u): u is string => !!u);

        if (!urls.length) {
          this.subiendo = false;
          this.mostrarModal(
            'Error de imágenes',
            'No se pudieron obtener las URLs de las imágenes.',
            'error'
          );
          return;
        }

        this.obraService.postObra({ ...crearObra, urlsImagenes: urls })
          .pipe(finalize(() => this.subiendo = false))
          .subscribe({
            next: () => {
              this.omitirGuard = true;
              this.formulario.reset();
              this.archivosSeleccionados = [];
              this.imagenesExistentes = [];
               this.mostrarModal(
                'Obra creada',
                'La obra fue creada correctamente.',
                'success',
                true
              );
            },
            error: (e) => {
    
              console.error(e);

              if(e.status === 404){
                this.mostrarModal(
                  'Estudio no encontrado',
                  'El estudio seleccionado no existe.',
                  'warning'
                );
              }else if(e.status ===  401){
                 this.mostrarModal(
                  'Sin permisos',
                  'No puede crear una obra para un estudio al que no pertenece.',
                  'error'
                );
              }else if(e.status === 406){
                  this.mostrarModal(
                  'Obra duplicada',
                  'Ya existe una obra con el mismo nombre en el mismo estudio.',
                  'warning'
                );
              }else if(e.status >= 500){
                 this.mostrarModal(
                  'Error del servidor',
                  'Ocurrió un error al crear la obra. Intente más tarde.',
                  'error'
                );
              }else{
                this.mostrarModal(
                  'Error al crear',
                  'No se pudo crear la obra.',
                  'error'
                );
              }

            }
          });
      },
      error: (e) => {
        console.error(e);
        this.subiendo = false;
        this.mostrarModal(
          'Error al subir imágenes',
          'No se pudieron subir las imágenes de la obra.',
          'error'
        );
      }
    });
  }


  esNegativo(): string{

    if(this.formulario.get('anioEstado')?.invalid){
      return '';
    }else{
      let edad = Number(this.formulario.get('anioEstado')?.value ?? NaN);

      if(edad >= 0){
        return '(d.C.)';
      }else if(edad < 0){
        return '(a.C.)';
      }else{
        return '';
      }
    }

    
    
    
  }
}

