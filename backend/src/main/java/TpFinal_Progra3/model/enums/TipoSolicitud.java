package TpFinal_Progra3.model.enums;

import lombok.Getter;

@Getter
public enum TipoSolicitud {

    ALTA_ARQUITECTO("Solicitud Rol Arquitecto"),
    BAJA_ROL("Solicitud quitar Rol");

    private final String descripcion;

    TipoSolicitud(String descripcion) {
        this.descripcion = descripcion;
    }
}

