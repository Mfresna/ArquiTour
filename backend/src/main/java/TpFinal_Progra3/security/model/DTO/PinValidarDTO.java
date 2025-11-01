package TpFinal_Progra3.security.model.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record PinValidarDTO(

        @NotBlank
        @Email
        String email,

        @NotNull
        String pin
) {}
