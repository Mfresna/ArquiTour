//package TpFinal_Progra3.repositoriesTesters;
//
//import TpFinal_Progra3.security.model.entities.Rol;
//import TpFinal_Progra3.security.model.enums.RolUsuario;
//import TpFinal_Progra3.security.repositories.RolRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.util.Optional;
//
///**
// * <b>TEST PASSED OK</b>
// */
//@SpringBootTest
//public class RolRepositoryTest {
//
//    @Autowired
//    private RolRepository rolRepository;
//
//    @Test
//    void testGuardarRol() {
//        Rol rol = Rol.builder()
//                .rol(RolUsuario.ROLE_USUARIO)
//                .build();
//        rolRepository.save(rol);
//    }
//
//    @Test
//    void testBuscarRol() {
//        Optional<Rol> rol = rolRepository.findByRol(RolUsuario.ROLE_USUARIO);
//        rol.ifPresent(System.out::println);
//    }
//
//    @Test
//    void testExisteRol() {
//        System.out.println(rolRepository.existsByRol(RolUsuario.ROLE_USUARIO));
//        System.out.println(rolRepository.existsByRol(RolUsuario.ROLE_ADMINISTRADOR));
//    }
//
//}
