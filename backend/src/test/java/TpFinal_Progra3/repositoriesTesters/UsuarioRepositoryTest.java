//package TpFinal_Progra3.repositoriesTesters;
//
//import TpFinal_Progra3.model.entities.Usuario;
//import TpFinal_Progra3.repositories.UsuarioRepository;
//import TpFinal_Progra3.security.model.entities.Credencial;
//import TpFinal_Progra3.security.model.entities.Rol;
//import TpFinal_Progra3.security.model.enums.RolUsuario;
//import TpFinal_Progra3.security.repositories.CredencialRepository;
//import TpFinal_Progra3.security.repositories.RolRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.time.LocalDate;
//import java.util.Optional;
//import java.util.Set;
//
///**
// * <b>TEST PASSED OK</b>
// */
//@SpringBootTest
//public class UsuarioRepositoryTest {
//    @Autowired
//    private UsuarioRepository usuarioRepository;
//
//    @Autowired
//    private CredencialRepository credencialRepository;
//
//    @Autowired
//    private RolRepository rolRepository;
//
//    /**
//     * TESTEAR CON LA BASE DE DATOS VACIA
//     */
//    @Test
//    void testGuardarUsuario() {
//        //Si no encuentra el Rol lo crea
//        Rol rol = rolRepository.findByRol(RolUsuario.ROLE_USUARIO)
//                .orElseGet(() -> rolRepository.save(
//                                Rol.builder()
//                                .rol(RolUsuario.ROLE_USUARIO)
//                                .build()
//                ));
//
//        Credencial credencial = Credencial.builder()
//                .email("test1@gmail.com")
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
//
//    @Test
//    void actualizarUsuario(){
//        Usuario usuario = usuarioRepository.findByEmailIgnoreCase("test@gmail.com").get();
//        usuario.setApellido("Apellido Modificado");
//        usuarioRepository.save(usuario);
//    }
//
//    @Test
//    void testBuscarEmail(){
//        Optional<Usuario> usuario = usuarioRepository.findByEmailIgnoreCase("test@gmail.com");
//        usuario.ifPresent(System.out::println);
//    }
//
//    //BUSCAR POR ESTADO
//    @Test
//    void testUsuariosActivos(){
//        System.out.println(usuarioRepository.findByIsActivoTrue());
//    }
//
//    @Test
//    void testUsuariosDesactivados(){
//        System.out.println(usuarioRepository.findByIsActivoFalse());
//    }
//
//    //BUSCAR POR NOMBRE Y APELLIDO
//    @Test
//    void testBuscarNombre(){
//        System.out.println(usuarioRepository.findByNombreIgnoreCase("tester"));
//    }
//    @Test
//    void testBuscarApellido(){
//        System.out.println(usuarioRepository.findByApellidoIgnoreCase("TESTER"));
//    }
//
//    //EXISTE EMAIL
//    @Test
//    void testExisteEmail(){
//        System.out.println("Existe:" + usuarioRepository.existsByEmailIgnoreCase("test@gmail.com"));
//    }
//
//}
