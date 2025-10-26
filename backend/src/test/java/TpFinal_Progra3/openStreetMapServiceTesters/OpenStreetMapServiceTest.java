package TpFinal_Progra3.openStreetMapServiceTesters;

import TpFinal_Progra3.services.OpenStreetMapService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class OpenStreetMapServiceTest {

    @Autowired
    private OpenStreetMapService osmService;

    @Test
    void testPedirURL(){
        System.out.println(osmService.generarMapaConMarcador(-34.603700,-58.381600, 15));
    }

}
