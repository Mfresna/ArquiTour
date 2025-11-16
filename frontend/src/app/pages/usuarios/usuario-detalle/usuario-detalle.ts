import { AfterViewInit, Component, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { PinService } from '../../../auth/services/pinService/pin-service';
import { fechaNacValidador } from '../../../auth/validadores/fechaValidador';
import { CamposIguales } from '../../../auth/validadores/igualdadValidador';
import { caracteresValidador } from '../../../auth/validadores/passCaracteresValidador';
import { nombreValidador, apellidoValidador } from '../../../auth/validadores/textoValidador';
import { DragZoneImagenes } from '../../../components/drag-zone-imagenes/drag-zone-imagenes';
import { ImagenService } from '../../../services/imagenService/imagen-service';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { PinVerificador } from '../../../auth/components/pin/pin-verificador';
import { EsperandoModal } from '../../../components/esperando-modal/esperando-modal';
import { DragZoneSimple } from '../../../components/drag-zone-simple/drag-zone-simple';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-usuario-detalle',
  imports: [ReactiveFormsModule, DragZoneSimple,EsperandoModal],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css',
})
export class UsuarioDetalle implements OnInit, AfterViewInit{

  perfilForm!: FormGroup;

  id!: number;
  emailRegistrado!: string;
  nombre!: string;
  apellido!: string;

  imagenUrlExistente!: string;
  nuevaImagen: File | null = null;
  quitadoImg: boolean = false;

  editando: boolean = false;

  spinerVisible: boolean = false;
  spinerMensaje!: string;

    //EMITERS
  @Output() volverEmit = new EventEmitter<void>();

    //COMPONENTE DE IMAGEN
  @ViewChild('campoImagen') campoImagen!: DragZoneImagenes;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private imagenService: ImagenService,
    private router: Router,
    private route: ActivatedRoute,
    private pinService: PinService    
  ) {}
  
  ngOnInit(): void {
    this.perfilForm = this.fb.group(
      {
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        nombre: [{ value: '', disabled: true }, [
          Validators.required, 
          Validators.minLength(2),
          Validators.maxLength(50),  
          nombreValidador]],
        apellido: [{ value: '', disabled: true }, [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50), 
          apellidoValidador
        ]],
        fechaNacimiento: [{ value: '', disabled: true }, [
          Validators.required,
          fechaNacValidador(5)
        ]],
        descripcion: [{ value: '', disabled: true }, [
          Validators.maxLength(280),
          Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\-_\!¡&\s\.,]+$/)
        ]],
        imagenUrl:[{ value: '', disabled: true },[]]
      }
    );

    //Carga los Datos
    const idParam = this.route.snapshot.params['id'];
    idParam ? this.cargarusuario(idParam) : this.cargarMe();

  }

  ngAfterViewInit(): void {
    //Esto carga el componente del hijo
  }

//========================== REGISTRO EN EL FORMULARIO

  accionBoton(){
    if(!this.editando){
      //estoy MODIFICANDO
      this.editando = true;
      this.habilitarCampos();

    }else{
      //Ya Modifique estoy GUARDANDO
      this.actualizarme();
    }

  }

  cambiarPass(){
    this.router.navigate(['/cambiarpass']);
  }

//========================== PASOS DE ACTUALIZACION
  private actualizarme() {

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    this.spinerVisible = true;
    this.spinerMensaje = "Actualizando Usuario...";

    this.verficiarImgNueva().pipe(
      switchMap(() => {
        const formularioCompleto = {
          ...this.perfilForm.getRawValue(),
          id: this.id
        };
        return this.usuarioService.actualizarPerfil(formularioCompleto);
      }),
      finalize(() =>{
        this.spinerVisible = false;
        this.editando = false;
      })
    ).subscribe({
      next: () => {
        //Recarga al usuario
        const idParam = this.route.snapshot.params['id'];
        idParam ? this.cargarusuario(idParam) : this.cargarMe();

        this.deshabilitarCampos()
        //Recargar Componente
      }
      ,
      error: (e) => {
        if (e.status === 400) alert("Error en los datos cargados");
        else if (e.status === 403) alert("El usuario no se puede modificar");
        else console.error(e);
      }
    });

  }

  private verficiarImgNueva(): Observable<void> {

    if (this.nuevaImagen) {
      return this.actualizarImg().pipe(
        tap((url) => {
          this.perfilForm.get('imagenUrl')?.setValue(url);
        }),
        map(() => void 0)
      );

    } else {

      if (this.quitadoImg){
        //HABIA IMG Y LA SACARON
        this.perfilForm.get('imagenUrl')?.setValue(null);
      } else {
        this.perfilForm.get('imagenUrl')?.setValue(this.imagenUrlExistente);
      }

      return of(void 0);
    }

  }


  private actualizarImg(): Observable<string> {

    return this.imagenService.subirImagen([this.nuevaImagen!]).pipe(
      map(urls => urls[0]),
      switchMap(urlImagen =>
        this.usuarioService.actualizarFotoPerfil(urlImagen).pipe(
          map(() => urlImagen)
        )
      ),
      catchError((err) => {
        console.error("Error en la actualización de la imagen", err);
        return throwError(() => err);
      })
    );

  }


  
//===================================================

  //HABILITAR CAMPOS
  private habilitarCampos(){
    this.perfilForm.enable();
    this.perfilForm.get('email')?.disable();
  }

  private deshabilitarCampos(){
    this.perfilForm.disable();
  }

  //LIMITA LA CANTIDAD DE LINEAS DEL TEXTAREA
  limitarLineas(event: Event, maxLineas: number) {
    const textarea = event.target as HTMLTextAreaElement;
    const lineas = textarea.value.split('\n');
    if (lineas.length > maxLineas) {
      textarea.value = lineas.slice(0, maxLineas).join('\n');
      this.perfilForm.get('descripcion')?.setValue(textarea.value);
    }
  }

//===================================================
  //CARGAR DATOS

  private cargarMe(){
    this.usuarioService.getUsuarioMe().subscribe({
      next: (item) => {
        this.perfilForm.patchValue(item);

        this.id = item.id;
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen;
      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
      }
    });
  }

  private cargarusuario(id: string){
    this.usuarioService.getUsuario(id).subscribe({
      next: (item) => {
        this.perfilForm.patchValue(item);
        
        this.id = item.id;
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen;
      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
      }
    });
  }

  cargarImg(url: string): string | null{
    if(url){
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${environment.apiUrl}${path}`;
    }
    return null;
  }



}