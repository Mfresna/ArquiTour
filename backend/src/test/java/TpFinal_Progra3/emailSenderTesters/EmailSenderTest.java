package TpFinal_Progra3.emailSenderTesters;

import TpFinal_Progra3.security.services.JwtService;
import TpFinal_Progra3.services.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmailSenderTest {

    @Autowired
    private EmailService enviarmail;
    @Autowired
    private JwtService jwtService;

    @Test
    void enviarMailTest() {
        //enviarmail.mailResetPass("afuentes0491@gmail.com",jwtService.generarToken(1L));
    }

}
