package TpFinal_Progra3.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import java.util.Objects;

@Configuration
public class DotEnvConfig {

    //Como es un bloque static en una clase Configuration se ejecute antes que el resto
    static {

        Dotenv dotenv = Dotenv.load();

        //Carga las Variables en el sistema
        System.setProperty("spring.datasource.url", Objects.requireNonNull(dotenv.get("DB_URL")));
        System.setProperty("spring.datasource.username", Objects.requireNonNull(dotenv.get("DB_USERNAME")));
        System.setProperty("spring.datasource.password", Objects.requireNonNull(dotenv.get("DB_PASSWORD")));

        //SMTP-Google
        System.setProperty("spring.mail.username", Objects.requireNonNull(dotenv.get("EMAIL")));
        System.setProperty("spring.mail.password", Objects.requireNonNull(dotenv.get("EMAIL_PASSWORD")));

        //JWT
        System.setProperty("jwt.secret", Objects.requireNonNull(dotenv.get("JWT_SECRET")));

        //CLOUDINARY IMAGENES
        System.setProperty("cloud.name", Objects.requireNonNull(dotenv.get("TU_CLOUD_NAME")));
        System.setProperty("cloud.key", Objects.requireNonNull(dotenv.get("TU_API_KEY")));
        System.setProperty("cloud.secret", Objects.requireNonNull(dotenv.get("TU_API_SECRET")));

        //CREDENCIALES ADMINISTRADOR DEFAULT
        System.setProperty("default.admin.email", Objects.requireNonNull(dotenv.get("DEFAULT_ADMIN_EMAIL")));
        System.setProperty("default.admin.password", Objects.requireNonNull(dotenv.get("DEFAULT_ADMIN_PASSWORD")));
    }
}
