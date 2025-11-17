export interface UsrRequestModel {
    //Recive el Back
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;   // formato 'YYYY-MM-DD'
    
    descripcion?: string | null;
    imagenUrl?: string | null;
}
