package TpFinal_Progra3.model.entities.solicitudes;

import TpFinal_Progra3.security.model.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "solicitud_baja_rol")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudBajaRol extends Solicitud {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rolAEliminar;

    @Column(length = 560)
    private String motivo;

}
