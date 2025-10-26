package TpFinal_Progra3.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estado de avance de una obra")
public enum EstadoObra {
    @Schema(description = "Obra demolida o en proceso de demolición")
    DEMOLICION,
    @Schema(description = "Obra actualmente en construcción")
    CONSTRUCCION,
    @Schema(description = "Obra en etapa de anteproyecto o proyecto")
    PROYECTO,
    @Schema(description = "Obra completamente finalizada")
    FINALIZADA
}
