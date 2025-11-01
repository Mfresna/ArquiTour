package TpFinal_Progra3.security.model.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Builder
public record PinRequestDTO(
        @NotBlank
        @Email
        String email) {}
