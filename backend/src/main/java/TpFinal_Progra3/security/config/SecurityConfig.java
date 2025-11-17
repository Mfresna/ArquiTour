package TpFinal_Progra3.security.config;

import TpFinal_Progra3.security.filters.JwtAuthenticationFilter;
import TpFinal_Progra3.security.filters.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
<<<<<<< HEAD
=======
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
>>>>>>> backup

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@EnableMethodSecurity(prePostEnabled = true) //PERMITE VERIFICAR EL ROL EN CADA ENDPOINT
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    //Este es el manejador de Errores que se lanzan antes del Controller
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, RestAuthenticationEntryPoint restAuthenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain (HttpSecurity http) throws Exception {
        // Configura las reglas de autorización para las solicitudes HTTP.
        http.authorizeHttpRequests(auth -> auth
                        // Swagger + OpenAPI
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        //autenticacion sin restriccion
                        .requestMatchers("/auth/**").permitAll()
<<<<<<< HEAD
                        .requestMatchers("/imagen/**").permitAll()
                        .requestMatchers("/validacion/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/usuarios").permitAll()
=======
                        .requestMatchers("/validacion/**").permitAll()
                        .requestMatchers("/imagen/**").permitAll()

                        .requestMatchers(HttpMethod.POST,"/usuarios/registrarme").permitAll()

>>>>>>> backup
                        // Otros EndPoints deben estar autenticados
                        .anyRequest().authenticated())

                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
<<<<<<< HEAD
                //Esto Ejecuta mei filtro personalizado para login y pass que va a retornar si es valido
=======
                //Esto Ejecuta mi filtro personalizado para login y pass que va a retornar si es valido
>>>>>>> backup
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                //Establece la clase encargada de manejar las excepciones que sean lanzadas.
                .exceptionHandling(e -> e.authenticationEntryPoint(restAuthenticationEntryPoint));

        // Devuelve la cadena de filtros de seguridad
        return http.build();
    }
<<<<<<< HEAD
=======

    //-------------- CORS ------------------//

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var source = new UrlBasedCorsConfigurationSource();

        // === CORS con credenciales para rutas que usan cookies/JWT (obras, auth, etc.) ===
        CorsConfiguration cred = new CorsConfiguration();
            cred.setAllowedOriginPatterns(List.of("http://localhost:4200", "http://127.0.0.1:4200"));
            cred.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS","HEAD"));
            cred.setAllowedHeaders(List.of("*"));
            cred.setExposedHeaders(List.of("Authorization", "Set-Cookie")); // agrega Content-Disposition si vas a leer el nombre de archivo desde XHR
            cred.setAllowCredentials(true);
            cred.setMaxAge(3600L);

        // Aplica a lo que viaja con cookies/headers
        source.registerCorsConfiguration("/**", cred);

        return source;
    }




>>>>>>> backup
}
