package TpFinal_Progra3.services;

import TpFinal_Progra3.exceptions.EmailNoEnviadoException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
<<<<<<< HEAD
=======
import org.springframework.beans.factory.annotation.Value;
>>>>>>> backup
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

<<<<<<< HEAD
=======
    @Value("${url.front}")
    private String urlFront;

>>>>>>> backup
    public void mailResetPass(String emailUsuario, String token) throws EmailNoEnviadoException {
        try {
            MimeMessage mensajePersonalizado = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensajePersonalizado, true);

            helper.setTo(emailUsuario);
            helper.setSubject("Restablecer su Contraseña de ArquiTour");
            helper.setText(generarCuerpo(token), true);

            //Email desde el que se manda el correo (CARGADO EN .ENV)
            helper.setFrom(System.getProperty("spring.mail.username"));


            mailSender.send(mensajePersonalizado);
        }catch(MailException me) {

            if(me.getCause() instanceof jakarta.mail.AuthenticationFailedException){
                //ERROR EN LA AUTENTICACION DE LA APIKEY DE GOOGLE
                throw new EmailNoEnviadoException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error en la configuracion SMTP del servidor.\n" + me.getMessage());
            }
        }catch (Exception e) {
            throw new EmailNoEnviadoException("Error en el envio del Email para restaurar la contraseña.\n" + e.getMessage());
        }
    }

    private String generarCuerpo (String token){
        System.out.println(token);
<<<<<<< HEAD
        String urlReset = "http://localhost:8080/auth/password/" + token;
=======

        String urlReset = urlFront + "/auth/password/" + token;
>>>>>>> backup

        return "<html>" +
                "<body style='font-family: Arial, sans-serif; text-align: center; background-color: #f9f9f9; padding: 20px;'>" +
                "<h2 style='color: #2E86C1;'>Restablecimiento de Contraseña</h2>" +
                "<p style='color: #555;'>Hemos recibido una solicitud para restaurar tu contraseña.</p>" +
                "<p>Si no realizaste esta acción, puedes ignorar este mensaje.</p>" +
                "<div style='margin: 20px auto;'>" +
                "<a href='" + urlReset + "' style='text-decoration: none; display: inline-block; padding: 10px 20px; " +
                "background-color: #2E86C1; color: white; font-weight: bold; border-radius: 5px;'>Restaurar Contraseña</a>" +
                "</div>" +
                "<p style='color: #999;'>Este enlace expirará en 24 horas.</p>" +
<<<<<<< HEAD
=======
                "<p>" + urlReset + "</p>" +
>>>>>>> backup
                "</body>" +
                "</html>";
    }

    //--------------------- PIN VALIDACION ------------------------//

    public void mailPinValidacion(String emailUsuario, String pin) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true);

            helper.setTo(emailUsuario);
            helper.setSubject("Tu PIN de verificación - ArquiTour");
            helper.setText(generarCuerpoPin(pin), true);
            helper.setFrom(System.getProperty("spring.mail.username"));

            mailSender.send(mensaje);
        } catch (MailException me) {
            if(me.getCause() instanceof jakarta.mail.AuthenticationFailedException){
                throw new EmailNoEnviadoException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Error en la configuracion SMTP del servidor.\n" + me.getMessage());
            }
            throw new EmailNoEnviadoException("Error en el envio del PIN.\n" + me.getMessage());
        } catch (Exception e) {
            throw new EmailNoEnviadoException("Error en el envio del PIN.\n" + e.getMessage());
        }
    }

    private String generarCuerpoPin(String pin){
        return "<html><body style='font-family: Arial; text-align:center; padding:20px;'>"
                + "<h2 style='color:#2E86C1;'>Verificación de Email</h2>"
                + "<p>Usá este PIN. Caduca en 10 minutos.</p>"
                + "<div style='font-size:28px;font-weight:bold;letter-spacing:6px;margin:16px 0;'>"
                + pin + "</div>"
                + "<p style='color:#888'>Si no fuiste vos, ignorá el mensaje.</p>"
                + "</body></html>";
    }

<<<<<<< HEAD
=======


>>>>>>> backup
}
