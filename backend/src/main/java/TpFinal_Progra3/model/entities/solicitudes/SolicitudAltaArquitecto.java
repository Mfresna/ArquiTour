package TpFinal_Progra3.model.entities.solicitudes;

import TpFinal_Progra3.model.entities.Imagen;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Entity
@Table(name = "solicitud_alta_arquitecto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudAltaArquitecto extends Solicitud{

    private String matriculaArquitecto;

    private String universidad;

    private Integer anioRecibido;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(
            name = "imagenes_solicitud",
            joinColumns = @JoinColumn(name = "solicitud_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "imagen_id", nullable = false)
    )
    private List<Imagen> imagenesSolicitud;
}
