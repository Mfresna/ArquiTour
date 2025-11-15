import { AfterViewInit, Component, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
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


@Component({
  selector: 'app-usuario-detalle',
  imports: [ReactiveFormsModule, DragZoneSimple],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css',
})
export class UsuarioDetalle implements OnInit, AfterViewInit{

  perfilForm!: FormGroup;

  emailRegistrado!: string;
  nombre!: string;
  apellido!: string;
  imagenUrlExistente!: string;

  editando: boolean = false;

  spinerVisible: boolean = false;
  spinerMensaje!: string;

  id!: string;

    //EMITERS
  @Output() volverEmit = new EventEmitter<void>();

    //COMPONENTE DE IMAGEN
  @ViewChild('campoImagen') campoImagen!: DragZoneImagenes;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private pinService: PinService,
    private imagenService: ImagenService
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
    }

  }

  cambiarPass(){
    this.router.navigate(['/cambiarpass']);
  }
//========================== PASOS DE REGISTRACION
  private registrarme(){

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
    }else{

    }      
  }
  
//===================================================

  //HABILITAR CAMPOS
  private habilitarCampos(){
    this.perfilForm.enable();
    this.perfilForm.get('email')?.disable();
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
  //HABILITAR CAMPOS
  private cargarMe(){
    this.usuarioService.getUsuarioMe().subscribe({
      next: (item) => {
        this.perfilForm.patchValue(item);
        
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen
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
        
        this.emailRegistrado = item.email;
        this.nombre = item.nombre;
        this.apellido = item.apellido;
        this.imagenUrlExistente = item.urlImagen
      },
      error: (e) => {
        console.error("No se puede leer el usuario", e);
      }
    });
  }



}