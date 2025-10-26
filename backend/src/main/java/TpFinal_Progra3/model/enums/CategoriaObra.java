package TpFinal_Progra3.model.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "Categorías de obra arquitectónica")
public enum CategoriaObra {

    @Schema(description = "Arquitectura residencial: casas, viviendas, departamentos")
    ARQ_RESIDENCIAL("Arquitectura Residencial"),

    @Schema(description = "Arquitectura comercial: locales, oficinas, centros comerciales")
    ARQ_COMERCIAL("Arquitectura Comercial"),

    @Schema(description = "Arquitectura educacional: escuelas, universidades, institutos")
    ARQ_EDUCACIONAL("Arquitectura Educacional"),

    @Schema(description = "Arquitectura cultural: museos, teatros, centros culturales")
    ARQ_CULTURAL("Arquitectura Cultural"),

    @Schema(description = "Arquitectura de salud: hospitales, clínicas, centros médicos")
    ARQ_SALUD("Arquitectura de Salud"),

    @Schema(description = "Arquitectura pública e institucional: edificios de gobierno, municipalidades")
    ARQ_PUBLICA_INSTIT("Arquitectura Pública e Institucional"),

    @Schema(description = "Arquitectura industrial: fábricas, naves, depósitos")
    ARQ_INDUSTRIAL("Arquitectura Industrial"),

    @Schema(description = "Arquitectura deportiva: estadios, gimnasios, polideportivos")
    ARQ_DEPORTIVA("Arquitectura Deportiva"),

    @Schema(description = "Arquitectura religiosa: iglesias, templos, mezquitas, sinagogas")
    ARQ_RELIGIOSA("Arquitectura Religiosa"),

    @Schema(description = "Paisajismo y urbanismo: diseño de parques, plazas, espacios urbanos")
    PAISAJISMO_URBANISMO("Paisajismo y Urbanismo"),

    @Schema(description = "Arquitectura patrimonial y de restauración: recuperación y puesta en valor")
    ARQ_PAT_RESTAUR("Arquitectura Patrimonial y de Restauración"),

    @Schema(description = "Arquitectura temporaria: pabellones, stands, instalaciones efímeras")
    ARQ_TEMPORARIA("Arquitectura Temporaria (Pabellones, Instalaciones, Stands)");

    private final String descripcion;

    CategoriaObra(String descripcion) {
        this.descripcion = descripcion;
    }

    @Override
    public String toString() {
        return descripcion;
    }

}
