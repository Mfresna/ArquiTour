package TpFinal_Progra3.repositoriesTesters;

import TpFinal_Progra3.model.entities.EstudioArq;
import TpFinal_Progra3.repositories.EstudioArqRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

/**
 * <b>TEST PASSED OK</b>
 */
@SpringBootTest
public class EstudioArqRepositoryTest {

    @Autowired
    private EstudioArqRepository estudioArqRepository;

    @Test
    void testCargarEstudioArquitectura(){
        EstudioArq estudioArq = EstudioArq.builder()
                .nombre("Estudio Test")
                .build();
        estudioArqRepository.save(estudioArq);
    }

    @Test
    void testBuscarNombre(){
        //No puedo imprimir el objeto completo pq si no tiene obras o arquitectos se rompe el print
        Optional<EstudioArq> estudioArq = estudioArqRepository.findByNombreIgnoreCase("Estudio Test");
        System.out.println(estudioArq.get().getNombre());
    }

    @Test
    void testBuscarNombreContenido(){
        //No puedo imprimir el objeto completo pq si no tiene obras o arquitectos se rompe el print
        List<EstudioArq> estudioArq = estudioArqRepository.findByNombreContainingIgnoreCase("Test");
        for(EstudioArq e : estudioArq){
            System.out.println(e.getNombre());
        }
    }

    @Test
    void testBuscarID(){
        //No puedo imprimir el objeto completo pq si no tiene obras o arquitectos se rompe el print
        Optional<EstudioArq> estudioArq = estudioArqRepository.findById(1L);
        System.out.println(estudioArq.get().getNombre());
    }

}
