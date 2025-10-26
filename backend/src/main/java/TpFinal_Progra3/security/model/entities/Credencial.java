package TpFinal_Progra3.security.model.entities;

import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "credenciales")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Credencial implements UserDetails{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //es el Username
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @OneToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id", unique = true)
    //@OneToOne(mappedBy = "credencial",fetch = FetchType.LAZY)
    private Usuario usuario;

    //Con las credenciales trae el rol del usuario, este rol lo trae inmediatamente cuando se carga el usr por eso el EAGER
    @ManyToMany(cascade = CascadeType.MERGE,fetch = FetchType.EAGER)
    @JoinTable(
            name = "roles_credencial",
            joinColumns = @JoinColumn(name = "credencial_id"),
            inverseJoinColumns = @JoinColumn(name = "rol_id")
    )
    private Set<Rol> roles = new HashSet<>();


    //METODOS
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        roles.forEach(rol -> authorities.add(
                new SimpleGrantedAuthority(rol.getRol().name())));

        return authorities;
    }

    public boolean tieneRolUsuario (RolUsuario rol){
        return roles.stream().map(Rol::getRol).anyMatch(r -> r.equals(rol));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isEnabled() {
        //Devuelve si el usuario esta Activo
        return usuario.getIsActivo();
        //return true;
    }



}
