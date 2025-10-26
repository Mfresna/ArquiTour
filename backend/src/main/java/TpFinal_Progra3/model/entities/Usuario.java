package TpFinal_Progra3.model.entities;

import TpFinal_Progra3.security.model.entities.Credencial;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    //@Email(message = "El correo debe tener un formato válido")
    //@NotBlank(message = "El correo no puede estar vacío")
    //@Size(max = 100)
    private String email;


    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "credencial_id", referencedColumnName = "id", nullable = false, unique = true)
    private Credencial credencial;

    @Column(nullable = false, length = 20)
    //@Size(min = 1, max = 20, message = "El nombre es demasiado largo")
    //@NotBlank(message = "El nombre no puede estar vacio")
    private String nombre;

    @Column(nullable = false, length = 35)
    //@NotBlank(message = "El apellido no puede estar vacio")
    private String apellido;

    @Column(nullable = false)
    //@Past(message = "La fecha de nacimiento debe ser anterior a hoy")
    private LocalDate fechaNacimiento;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "imagen_id")
    private Imagen imagen;

    @Builder.Default //Hace que activo se defina true si no se especifica en builder
    @Column(nullable = false)
    private Boolean isActivo = true;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "usuarios_estudio",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "estudio_id")
    )
    private List<EstudioArq> estudios = new ArrayList<>(); //Un usr puede pertenecer a muchos estudios y un estudio tener muchos usr

    @Builder.Default
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Favorito> listaFavoritos = new ArrayList<>();

}