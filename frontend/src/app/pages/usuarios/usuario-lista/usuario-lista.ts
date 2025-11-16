import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EstudioModel } from '../../../models/estudioModels/estudioModel';
import { CategoriaObraModel, CategoriaObraDescripcion } from '../../../models/obraModels/categoriaObraModel';
import { EstadoObraModel, EstadoObraDescripcion } from '../../../models/obraModels/estadoObraModel';
import { ObraModel } from '../../../models/obraModels/obraModel';
import { EstudioService } from '../../../services/estudioService/estudio-service';
import { ObraService } from '../../../services/obraService/obra-service';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuarioService/usuario-service';
import { RolModel, RolModelDescripcion, RolPrioridad } from '../../../models/usuarioModels/RolModel';
import { UsuarioModel } from '../../../models/usuarioModels/usuaroModel';

@Component({
  selector: 'app-usuario-lista',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.css',
})
export class UsuarioLista implements OnInit {

  filtroForm!: FormGroup;

  roles = Object.values(RolModel);
  RolModelDescripcion = RolModelDescripcion;

  usuarios!: UsuarioModel[];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.filtroForm = this.fb.group({
      nombre: ['',[]],
      apellido: ['',[]],
      email: ['',[]],
      isActivo: [null,[]],
      rol: [null,[]],
    });

    this.cargarUsuarios();
  }


  cargarUsuarios() {

    const usauriosFiltros = this.filtroForm.value;

    this.usuarioService.getUsuarios(
      usauriosFiltros.nombre?.trim() || null,
      usauriosFiltros.apellido?.trim() || null,
      usauriosFiltros.email?.trim() || null,
      usauriosFiltros.isActivo,
      usauriosFiltros.rol || null
    )
    .subscribe({
      next: (lista: UsuarioModel[]) =>{
        this.usuarios = lista;
      }, 
      error: (e) => {
        console.warn(e)
        alert('No se pudo cargar la lista de usurios');
      }
    });
  }

  limpiarFiltros() {
    this.filtroForm.reset({
      nombre: '',
      apellido: '',
      email: '',
      rol: null,
      isActivo: null
    });

    this.cargarUsuarios();
  }


  getDescripcionRol(roles: string[]): string | null {
    if (!roles || roles.length === 0) return 'Error en el Rol';

    const rolMaximo = this.getRolMaximo(roles);
    if (!rolMaximo) return 'Error en el Rol';

    return RolModelDescripcion[rolMaximo];
  }

  private getRolMaximo(roles: string[]): RolModel | null {
    if (!roles || roles.length === 0) return null;

    const rolesValidos = roles.filter(r => Object.values(RolModel).includes(r as RolModel)) as RolModel[];

    if (rolesValidos.length === 0) return null;

    return rolesValidos.reduce((max, actual) =>
      RolPrioridad[actual] > RolPrioridad[max] ? actual : max
    );
  }


}
