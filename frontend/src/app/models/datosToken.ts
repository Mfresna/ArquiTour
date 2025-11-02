import { RolToken } from "./rolTokenModel";

export interface DatosToken {
  roles: RolToken[];
  typ: string;
  sub: string;
  iat: number;
  exp: number;
}