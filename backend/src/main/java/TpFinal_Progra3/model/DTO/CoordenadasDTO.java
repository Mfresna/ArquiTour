package TpFinal_Progra3.model.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "DTO que representa la ubicación geográfica asociada a una dirección IP.")
public class  CoordenadasDTO {
    @Schema(
            description = "Latitud geográfica (rango: -90 a 90).",
            example = "-34.6037",
            minimum = "-90",
            maximum = "90",
            required = true
    )
    @NotNull(message = "La latitud no puede ser nula.")
    @DecimalMin(value = "-90.0", inclusive = true, message = "La latitud debe ser mayor o igual a -90.0.")
    @DecimalMax(value = "90.0", inclusive = true, message = "La latitud debe ser menor o igual a 90.0.")
    private double latitud;

    @Schema(
            description = "Longitud geográfica (rango: -180 a 180).",
            example = "-58.3816",
            minimum = "-180",
            maximum = "180",
            required = true
    )
    @NotNull(message = "La longitud no puede ser nula.")
    @DecimalMin(value = "-180.0", inclusive = true, message = "La longitud debe ser mayor o igual a -180.0.")
    @DecimalMax(value = "180.0", inclusive = true, message = "La longitud debe ser menor o igual a 180.0.")
    private double longitud;
}