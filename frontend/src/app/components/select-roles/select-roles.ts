import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { RolesEnum } from '../../models/usuarioModels/rolEnum';
import { RolModelDescripcion } from '../../models/usuarioModels/rolModels';

@Component({
  selector: 'app-select-roles',
  imports: [],
  templateUrl: './select-roles.html',
  styleUrl: './select-roles.css',
})
export class SelectRoles implements OnInit {

  @Input({ required: true }) rolesAnteriores!: RolesEnum[];
  @Input({ required: true }) id!: number;

  rolesExistentes = Object.values(RolesEnum); 
  rolModelDescripcion = RolModelDescripcion;

  rolesActuales: RolesEnum[] = [];

  @Output() cambiosRoles = new EventEmitter<{
      id: number;
      rolesAgregar: RolesEnum[];
      rolesBorrar: RolesEnum[];
    }>();

  @Output() cerrado = new EventEmitter<void>();

  constructor(
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.rolesActuales = [] //Primero lo limpio
    this.rolesActuales = [...this.rolesAnteriores];
  }

  tieneRol(rol: RolesEnum): boolean {
    return this.rolesActuales.includes(rol);
  }

  modificoRoles(rol: RolesEnum){
    if(this.tieneRol(rol)){
      this.rolesActuales = this.rolesActuales.filter(r => r !== rol);
    }else{
      this.rolesActuales.push(rol);
    }
  }

  confirmarCambios(): void {
    const rolesAgregar: RolesEnum[] = this.rolesActuales.filter(r => !this.rolesAnteriores.includes(r));
    const rolesBorrar:  RolesEnum[] = this.rolesAnteriores.filter(r => !this.rolesActuales.includes(r));

    this.cambiosRoles.emit({
      id: this.id,
      rolesAgregar,
      rolesBorrar,
    });
  }

  cancelar(){
    this.cerrado.emit();
  }

  aceptar(){
    //Compara que no sean iguales
    if(!this.rolesIguales(this.rolesActuales,this.rolesAnteriores)){
      this.confirmarCambios();
    }
    
    this.cerrado.emit();
  }

  private rolesIguales(actuales: RolesEnum[], anteriores: RolesEnum[]): boolean{
    return (actuales.every(x => anteriores.includes(x)) && anteriores.every(x => actuales.includes(x)));
  }


    //========== ESCUCHADORES
  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: any) { 
    if(!this.rolesIguales(this.rolesActuales,this.rolesAnteriores)){
      this.aceptar()
    }else{
      this.cancelar()
    }

  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent): void {
    // Usamos ElementRef para verificar si el clic fue dentro o fuera de nuestro componente.
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    
    // Si el clic fue FUERA, cerramos el menú.
    if (!clickedInside) {
      if(!this.rolesIguales(this.rolesActuales,this.rolesAnteriores)){
      this.aceptar()
      }else{
        this.cancelar()
      }
    }
  
  }
}
