package TpFinal_Progra3.config;

import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.repositories.UsuarioRepository;
import TpFinal_Progra3.security.model.entities.Credencial;
import TpFinal_Progra3.security.model.entities.Rol;
import TpFinal_Progra3.security.repositories.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Order(2) // Se ejecuta después de DataEnumLoad
public class InicializadorConfig implements CommandLineRunner{


    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${default.admin.email}")
    private String defaultAdminEmail;

    @Value("${default.admin.password}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args){

        // Verifico que el email por defecto (en .ENV) no existe
        if (usuarioRepository.findByEmailIgnoreCase(defaultAdminEmail).isEmpty()){
            Usuario usuarioADM = Usuario.builder()
                    .email(defaultAdminEmail)
                    .nombre("Administrador")
                    .apellido("Administrador")
                    .fechaNacimiento(LocalDate.now())
                    .descripcion("Administrador por Defecto de la App ArquiTour")
                    .build();

            usuarioADM.setCredencial(Credencial.builder()
                    .email(defaultAdminEmail)
                    .usuario(usuarioADM)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .roles(new HashSet<>(rolRepository.findAll()))  //Le asigna todos los roles en la BD
                    .build()
            );

            usuarioRepository.save(usuarioADM);

            //Solo por Consola
            System.out.println("Se dio de alta el usuario Administrador con las crdenciales: \n" +
                    "\tUsuario: " + defaultAdminEmail +
                    "\tContraseña: " + defaultAdminPassword);

        }else {

            Usuario usuarioADM = usuarioRepository.findByEmailIgnoreCase(defaultAdminEmail).get();

            Set<Rol> roles = new HashSet<>(rolRepository.findAll());

            if (!usuarioADM.getCredencial().getRoles().containsAll(roles)) {
                usuarioADM.getCredencial().getRoles().addAll(roles);
                usuarioRepository.save(usuarioADM);
                System.out.println("Se actualizaron roles del usuario admin.");
            }
        }
    }
}






