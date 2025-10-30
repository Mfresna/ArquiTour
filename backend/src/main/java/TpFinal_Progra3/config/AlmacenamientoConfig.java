package TpFinal_Progra3.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class AlmacenamientoConfig implements WebMvcConfigurer {

    //Ruta relativa de las imagenes
    @Value("${dir.imagenes}")
    private String dirImagenes;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path rutaGuardado = Paths.get(dirImagenes).toAbsolutePath().normalize();

        //Cuando la URL diga localhos:8080/imagen/nombre.jpg => la va a buscar a: rutaGuardada/nombre.jpg
        registry.addResourceHandler("/imagen/**")
                .addResourceLocations("file:" + rutaGuardado + "/")
                .setCachePeriod(3600);
    }
}
