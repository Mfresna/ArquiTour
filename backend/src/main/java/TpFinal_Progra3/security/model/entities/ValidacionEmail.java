package TpFinal_Progra3.security.model.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "validaciones")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidacionEmail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String pinHash;

    @Builder.Default
    @Column(nullable = false)
    private Long intentos = 0L;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime generacion = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private boolean validado = false;
}
