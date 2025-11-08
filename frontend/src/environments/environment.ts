export const environment = {
  production: false,    //Sirve solo para desarrollo, cuando hago ng build --prod (busca el env que dice production: true) 
  apiUrl: 'http://localhost:8080',   //  Su utiliza asi = private readonly baseUrl = `${environment.apiUrl}/auth`;
  portBack: '8080',
  imgEstudio: 'assets/img/por_defecto/estudioPerfil.png'

};