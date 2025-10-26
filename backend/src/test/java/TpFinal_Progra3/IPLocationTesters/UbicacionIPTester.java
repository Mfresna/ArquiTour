package TpFinal_Progra3.IPLocationTesters;

import TpFinal_Progra3.model.DTO.IPLocationDTO;
import TpFinal_Progra3.services.IPLocationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UbicacionIPTester {

    @Autowired
    private IPLocationService iPLocationService;

    @Test
    void testMiUbicacion(){
            IPLocationDTO dto = iPLocationService.obtenerUbicacion("190.188.89.16").get();
            System.out.println(dto);

    }

}
