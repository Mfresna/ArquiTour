//package TpFinal_Progra3.repositoriesTesters;
//
//import TpFinal_Progra3.security.model.entities.Credencial;
//import TpFinal_Progra3.security.model.entities.Rol;
//import TpFinal_Progra3.security.model.enums.RolUsuario;
//import TpFinal_Progra3.security.repositories.CredencialRepository;
//import TpFinal_Progra3.security.repositories.RolRepository;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//
//import java.util.Optional;
//import java.util.Set;
//
///**
// * <b>TEST PASSED OK</b>
// */
//@SpringBootTest
//public class CredencialRepositoryTest {
//
//    @Autowired
//    private CredencialRepository credencialRepository;
//
//    @Autowired
//    private RolRepository rolRepository;
//
//    @Test
//    void testGuardarCredencial() {
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
//        credencialRepository.save(credencial);
//    }
//
//    @Test
//    void testBuscarPorEmail() {
//        Optional<Credencial> credencial = credencialRepository.findByEmail("test@gmail.com");
//        credencial.ifPresent(System.out::println);
//    }
//
//    @Test
//    void testExisteEmail() {
//        System.out.println("Existe el Email: " + credencialRepository.existsByEmail("test@gmail.com"));
//    }
//
//
//}
