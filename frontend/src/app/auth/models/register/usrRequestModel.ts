export interface UsroRequestModel {
    //Recive el Back
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;   // formato 'YYYY-MM-DD'
    
    descripcion?: string;
    imagenUrl?: string;
}