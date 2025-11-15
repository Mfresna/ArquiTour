export interface UsuarioBasicoModel {
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    descripcion?: string | null;
    urlImagen?: string | null;
}