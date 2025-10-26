package TpFinal_Progra3.security.config;

import TpFinal_Progra3.security.model.entities.Rol;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import TpFinal_Progra3.security.repositories.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)   //Hace que se ejecute primero para evitar conflicto con la creacion del usuario administrador default
public class DataEnumLoad implements CommandLineRunner {

    private final RolRepository rolRepository;

    @Override
    public void run(String... args) {
        for (RolUsuario rolUsuario : RolUsuario.values()){
            if (rolRepository.findByRol(rolUsuario).isEmpty()) {
                //Crea el Rol con el valor rolUsuario y lo Guarda en la Base de Datos
                rolRepository.save(Rol.builder()
                        .rol(rolUsuario)
                        .build());
            }
        }
    }

}
