package TpFinal_Progra3.security.filters;

import TpFinal_Progra3.security.services.JwtService;
import TpFinal_Progra3.security.services.UserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer "))
        {
            //Si al llegar al filtro de autorizacion, no se tiene una autenticacion valida
            //Y el endpoint no es publico, se rechaza automaticamente.
            filterChain.doFilter(request, response);
            return;
        }

        //Obtiene el token cortando la palabra 'Bearer '
        final String jwt = authHeader.substring(7);

        //Obtiene el Usr del Subject del token
        final String username = jwtService.extractUsername(jwt);

        //Se verifica que no esté logeado el usuario
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        //Si el usuario existe en el token y NO hay una autenticación previa
        if (username != null && authentication == null){

            //Carga los detalles del usuario
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            //Verificación de la validez del token
            if (jwtService.isTokenValid(jwt, userDetails)) {
                //Objeto propio de Java para la autenticacion, saca las cosas de userDetails
                UsernamePasswordAuthenticationToken authToken = new
                        UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                //Se añaden detalles a la autenticacion, detalles webs como IP
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 11. Almacenar la autenticación en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        //Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
