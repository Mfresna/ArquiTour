package TpFinal_Progra3.emailSenderTesters;

import TpFinal_Progra3.security.services.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TokenGeneratorTest {

    @Autowired
    private JwtService jwt;

    @Test
    void generadorDeToken() {
        //String token = jwt.generarToken(1L);

        //System.out.println(token);

        //System.out.println(jwt.extractUsername(token));
    }




}
