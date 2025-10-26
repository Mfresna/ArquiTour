package TpFinal_Progra3.repositoriesTesters;

import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.repositories.ImagenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * <b>TEST PASSED OK</b>
 */
@SpringBootTest
public class ImagenRepositoryTest {

    @Autowired
    private ImagenRepository imagenRepository;

    @Test
    void testCargarImagen(){
        Imagen img = Imagen.builder()
                .nombre("testImg")
                .tipo("JPG")
                .url("www.miapiTest.com/laURL")
                .build();
        imagenRepository.save(img);
    }

    @Test
    void testBorrar(){
        Imagen img = imagenRepository.findByUrl("www.miapiTest.com/laURL").get();
        imagenRepository.delete(img);
    }

    @Test
    void testBuscarUrl(){
        System.out.println(imagenRepository.findByUrl("www.miapiTest.com/laURL").get());
    }

    @Test
    void testBuscarNombre(){
        System.out.println(imagenRepository.findByNombreIgnoreCase("testImg"));
    }

    @Test
    void testExisteImagen(){
        System.out.println("Existe: " + imagenRepository.existsByUrl("www.miapiTest.com/laURL"));
    }
}
