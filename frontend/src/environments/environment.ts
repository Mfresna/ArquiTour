export const environment = {
  production: false,    //Sirve solo para desarrollo, cuando hago ng build --prod (busca el env que dice production: true) 
  
  apiUrl: 'http://localhost:8080',   //  Su utiliza asi = private readonly baseUrl = `${environment.apiUrl}/auth`;
  portBack: '8080',
  imgEstudio: 'assets/img/por_defecto/estudioPerfil.png',
  imgObra: 'assets/img/por_defecto/obra.png',
  imgUsuario: 'assets/img/por_defecto/usuarioPerfil.png',
  imagenesFondo: [
    'assets/img/fondo/bg1.webp',
    'assets/img/fondo/bg2.webp',
    'assets/img/fondo/bg3.webp',
    'assets/img/fondo/bg4.webp',
    'assets/img/fondo/bg5.webp',
    'assets/img/fondo/bg6.webp',
    'assets/img/fondo/bg7.webp',
    'assets/img/fondo/bg8.webp'
  ],
  iconoMapaPrincipal: 'assets/icons/pin-obra.svg',
  iconoMapaPrincipalUsuario: 'assets/icons/pin-user.svg',
  templateMapa: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
};