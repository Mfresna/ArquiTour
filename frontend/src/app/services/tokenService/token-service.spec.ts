import { DatosToken } from "../../models/datosToken";
import { TokenService } from "./token-service";


fdescribe('TokenService con TOKEN REAL hardcodeado', () => {
  let service: TokenService;

  /**
   PEGAR ACÁ ACCESS TOKEN REAL 
   */
  const TOKEN_REAL = "";

  beforeEach(() => {
    service = new TokenService();
  });

  it('decodifica el token REAL y valida estructura básica', () => {
    // Sanidad: asegurarnos de que pegaste algo
    expect(typeof TOKEN_REAL).toBe('string');
    expect(TOKEN_REAL.split('.').length).withContext('El token debe tener 3 partes (JWT)').toBe(3);

    // Guardar en el servicio y decodificar
    service.guardarToken(TOKEN_REAL);
    const datos: DatosToken | null = service.obtenerDatosDelToken();

    // Debe poder decodificar
    expect(datos).withContext('No se pudo decodificar el token real').not.toBeNull();

    // Validar claims mínimos según tu modelo / payload real
    expect(typeof datos!.sub).toBe('string');     // email/identificador
    expect(typeof datos!.typ).toBe('string');     // "ACCESS"
    expect(typeof datos!.exp).toBe('number');     // expiración en UNIX
    expect(Array.isArray(datos!.roles)).toBeTrue();

    // Cada rol debe tener authority:string
    const authorities = datos!.roles.map(r => r?.authority ?? null);
    expect(authorities.every(a => typeof a === 'string'))
      .withContext('Cada rol debe incluir .authority (string)')
      .toBeTrue();

    // (Opcional) si esperás roles concretos, descomentá y ajustá:
    // expect(authorities).toContain('ROLE_ADMINISTRADOR');
    // expect(authorities).toContain('ROLE_ARQUITECTO');

    // Logs informativos (aparecen en la consola de Karma)
    // eslint-disable-next-line no-console
    console.log('Payload decodificado:', datos);
    const exp = service.obtenerExpiracion();
    // eslint-disable-next-line no-console
    console.log('Expira (UNIX):', exp, '→', exp ? new Date(exp * 1000).toString() : '—');
    // eslint-disable-next-line no-console
    console.log('¿estaExpirado()? →', service.estaExpirado());
  });

  it('permite limpiar el token luego de la prueba', () => {
    service.guardarToken(TOKEN_REAL);
    expect(service.obtenerToken()).toBeTruthy();
    service.borrarToken();
    expect(service.obtenerToken()).toBeNull();
  });
});