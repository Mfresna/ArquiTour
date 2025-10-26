package TpFinal_Progra3.model.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "estudios_arq")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstudioArq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @OneToMany(mappedBy = "estudio")
    private List<Obra> obras;

    @ManyToMany(mappedBy = "estudios")
    private List<Usuario> arquitectos;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "imagen_id")
    private Imagen imagen;
}