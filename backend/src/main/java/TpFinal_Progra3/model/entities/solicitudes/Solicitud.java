package TpFinal_Progra3.model.entities;

import TpFinal_Progra3.model.enums.EstadoSolicitud;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "solicitudes")
//es para que maneje con joins los hijos de esta clase
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public abstract class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    private LocalDate fechaCreacion = LocalDate.now();

    

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




    @Builder.Default
    @Column(nullable = false)
    private LocalDate fechaCreacion = LocalDate.now();

    private LocalDate fechaResolucion;

    @Column(length = 280)
    private String comentarioAdmin;

}
