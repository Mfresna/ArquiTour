//package TpFinal_Progra3.repositoriesTesters;
//
//import TpFinal_Progra3.model.entities.Notificacion;
//import TpFinal_Progra3.model.entities.Usuario;
//import TpFinal_Progra3.repositories.NotificacionRepository;
//import TpFinal_Progra3.repositories.UsuarioRepository;
//import TpFinal_Progra3.security.model.entities.Credencial;
//import TpFinal_Progra3.security.model.entities.Rol;
//import TpFinal_Progra3.security.model.enums.RolUsuario;
//import TpFinal_Progra3.security.repositories.RolRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.Set;
//
///**
// * <b>TEST PASSED OK</b>
// */
//@SpringBootTest
//public class NotificacionRepositoryTest {
//
//    @Autowired
//    private NotificacionRepository notificacionRepository;
//
//    @Autowired
//    private UsuarioRepository usuarioRepository;
//
//    @Autowired
//    private RolRepository rolRepository;
//
//    /**
//     * PROBAR CON LA BASE DE DATOS VACIA
//     */
//    @Test
//    void testCargarNotificacion(){
//
//        //Guardo un Usuario en la BD
//        altaUsuario();
//
//        Notificacion noti = Notificacion.builder()
//                .emisor(usuarioRepository.findByEmailIgnoreCase("test@gmail.com").get())
//                .receptor(usuarioRepository.findByEmailIgnoreCase("test@gmail.com").get())
//                .fecha(LocalDateTime.now())
//                .mensaje("Esto es una Prueba")
//                .build();
//        notificacionRepository.save(noti);
//    }
//
//    @Test
//    void testBucarReceptor(){
//        System.out.println(notificacionRepository.findByReceptor(usuarioRepository.findByEmailIgnoreCase("test@gmail.com").get()));
//    }
//
//    @Test
//    void testBucarReceptorNoLeidos(){
//        System.out.println(notificacionRepository.findByReceptorAndIsLeidoFalse(usuarioRepository.findByEmailIgnoreCase("test@gmail.com").get()));
//    }
//
//    @Test
//    void testBucarEmisor(){
//        System.out.println(notificacionRepository.findByEmisor(usuarioRepository.findByEmailIgnoreCase("test@gmail.com").get()));
//    }
//
//    void altaUsuario(){
//        //Si no encuentra el Rol lo crea
//        Rol rol = rolRepository.findByRol(RolUsuario.ROLE_USUARIO)
//                .orElseGet(() -> rolRepository.save(
//                        Rol.builder()
//                                .rol(RolUsuario.ROLE_USUARIO)
//                                .build()
//                ));
//
//        Credencial credencial = Credencial.builder()
//                .email("test@gmail.com")
//                .password("test")
//                .roles(Set.of(rol))
//                .build();
//
//        System.out.println(credencial);
//
//        Usuario usuario = Usuario.builder()
//                .email(credencial.getEmail())
//                .credencial(credencial)
//                .nombre("tester")
//                .apellido("tester")
//                .fechaNacimiento(LocalDate.now())
//                .build();
//
//        usuarioRepository.save(usuario);
//    }
//}
