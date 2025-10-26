package TpFinal_Progra3.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "favoritos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Favorito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //@NotBlank(message = "El nombre de la lista no puede estar vacio")
    //@Size(max = 100)
    @Column(nullable = false)
    private String nombreLista;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToMany
    @JoinTable(
            name = "obras_favorito",
            joinColumns = @JoinColumn(name = "favorito_id", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "obra_id", nullable = false)
    )
    private List<Obra> obras;

    @Builder.Default //Hace que la fecha si no se la defino sea la actual en el builder
    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
