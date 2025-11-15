export interface UsuarioFormBasicoModel {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    descripcion?: string;
    imagenUrl?: string;
}