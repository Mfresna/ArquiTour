export interface AuthResponse {
    /*Devuelve el Back => /login
    El Back devuelve el refreshtoken en la cookeie
    por eso no es un HostAttributeToken
    */
    accessToken: string;
    cambiarPass: boolean;
}
