package TpFinal_Progra3.security.model.DTO;

//Se usa 'record' para definir que es inmutable y que es un DTO
//Los usto en AUTHCONTROLLER
public record AuthResponse (String accessToken, boolean cambiarPass) {
}
