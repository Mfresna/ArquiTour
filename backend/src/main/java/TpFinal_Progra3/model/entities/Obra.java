package TpFinal_Progra3.model.entities;

import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "obras", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"nombre", "estudioarq_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Obra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoObra estado;

    private Integer anioEstado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaObra categoria;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String descripcion;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(
            name = "imagenes_obra",
            joinColumns = @JoinColumn(name = "imagen_id",nullable = false),
            inverseJoinColumns = @JoinColumn(name = "obra_id",nullable = false)
    )
    private List<Imagen> imagenes;

    @ManyToOne
    @JoinColumn(name = "estudioarq_id",nullable = false) // Clave foránea en la tabla Obra
    private EstudioArq estudio;
}