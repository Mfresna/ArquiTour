package TpFinal_Progra3.security.model.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

//Se usa 'record' para definir que es inmutable y que es un DTO
//Los uso en AUTHCONTROLLER
public record AuthRequest(

        @NotBlank(message = "El email no puede estar vacío")
        @Email(message = "El email debe tener un formato válido")
        String username,

        @NotBlank(message = "La Contraseña no puede estar vacia")
        String password

) {}
