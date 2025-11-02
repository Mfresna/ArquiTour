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
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
                        .requestMatchers("/validacion/**").permitAll()

                        .requestMatchers("/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/usuarios").permitAll()
                        // Otros EndPoints deben estar autenticados
                        .anyRequest().authenticated())

                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
                //Esto Ejecuta mi filtro personalizado para login y pass que va a retornar si es valido
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                //Establece la clase encargada de manejar las excepciones que sean lanzadas.
                .exceptionHandling(e -> e.authenticationEntryPoint(restAuthenticationEntryPoint));

        // Devuelve la cadena de filtros de seguridad
        return http.build();
    }

    //-------------- CORS ------------------//

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var source = new UrlBasedCorsConfigurationSource();

        // === CORS para API protegida (/api/** y todo lo que requiera credenciales) ===
        var api = new CorsConfiguration();
        api.setAllowedOriginPatterns(List.of("http://localhost:4200", "http://127.0.0.1:4200"));
        api.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        api.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With","Accept"));
        api.setExposedHeaders(List.of("Authorization","Content-Disposition"));
        api.setAllowCredentials(true);            // cookies + Authorization
        api.setMaxAge(3600L);
        // Ajustá el patrón a tus rutas reales (por ejemplo /api/**)
        source.registerCorsConfiguration("/api/**", api);
        source.registerCorsConfiguration("/auth/**", api);
        source.registerCorsConfiguration("/validacion/**", api);
        source.registerCorsConfiguration("/usuarios", api);

        // === CORS para imágenes públicas (sin cookies) ===
        var img = new CorsConfiguration();
        img.setAllowedOrigins(List.of("*"));      // público
        img.setAllowedMethods(List.of("GET","HEAD","OPTIONS"));
        img.setAllowedHeaders(List.of("*"));
        img.setExposedHeaders(List.of("Content-Disposition","Content-Type","Accept-Ranges"));
        img.setAllowCredentials(false);
        img.setMaxAge(86400L);
        source.registerCorsConfiguration("/imagen/**", img);

        return source;
    }




}
