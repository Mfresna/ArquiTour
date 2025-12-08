package TpFinal_Progra3.model.entities.solicitudes;

import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.enums.EstadoSolicitud;
import TpFinal_Progra3.model.enums.TipoSolicitud;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
//es para que maneje con joins los hijos de esta clase
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoSolicitud tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario; // el que pide el cambio de Rol

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoSolicitud estado = EstadoSolicitud.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_asignado_id")
    private Usuario adminAsignado; // el Admin que resuelve

    @Builder.Default
    @Column(nullable = false)
    //private LocalDate fechaCreacion = LocalDate.now();
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    //private LocalDate fechaResolucion;
    private LocalDateTime fechaResolucion;

    @Column(length = 560)
    private String comentarioAdmin;

}
