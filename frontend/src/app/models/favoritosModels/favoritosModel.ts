import { ObraModel } from "../obraModels/obraModel";


export interface FavoritosModel {
  id?: number;               
  nombreLista: string;        
  fechaCreacion?: string;   
  obras?: ObraModel[];       
}
