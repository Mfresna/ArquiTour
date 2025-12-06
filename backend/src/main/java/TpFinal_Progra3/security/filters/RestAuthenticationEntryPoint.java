package TpFinal_Progra3.security.filters;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Es un Manejador de errores de Autenticacion
 */
//public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
//
//    @Override
//    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
//
//        response.setContentType("application/json");
//        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//
//        String errorMessage = switch (authException) {
//            case BadCredentialsException badCredentialsException ->
//                    "Credenciales inválidas";
//            case DisabledException disabledException ->
//                    "Cuenta deshabilitada";
//            case LockedException lockedException ->
//                    "Cuenta bloqueada";
//            case AccountExpiredException accountExpiredException ->
//                    "Cuenta expirada";
//            case CredentialsExpiredException credentialsExpiredException ->
//                    "Credenciales expiradas";
//            case InsufficientAuthenticationException insufficientAuthenticationException ->
//                    "Autenticación insuficiente";
//            case AuthenticationServiceException authenticationServiceException ->
//                    "Error en el servicio de autenticación";
//            default -> "Error de autenticación: " + authException.getMessage();
//        };
//
//        String respuestaJson = String.format("{\"error\": \"%s\", \"status\": %d, \"path\": \"%s\"}",
//                errorMessage,
//                HttpServletResponse.SC_UNAUTHORIZED,
//                request.getRequestURI());
//
//        response.getWriter().write(respuestaJson);
//        response.getWriter().flush();
//    }
//
//}

@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {

        response.setContentType("application/json");

        String errorMessage;
        int statusCode;

        switch (authException) {
            case BadCredentialsException badCredentialsException -> {
                errorMessage = "Credenciales inválidas";
                statusCode = HttpServletResponse.SC_UNAUTHORIZED; // 401
            }
            case DisabledException disabledException -> {
                errorMessage = "Cuenta deshabilitada";
                statusCode = 423; // Locked
            }
            case LockedException lockedException -> {
                errorMessage = "Cuenta bloqueada";
                statusCode = 423; // Locked
            }
            case AccountExpiredException accountExpiredException -> {
                errorMessage = "Cuenta expirada";
                statusCode = HttpServletResponse.SC_FORBIDDEN; // 403
            }
            case CredentialsExpiredException credentialsExpiredException -> {
                errorMessage = "Credenciales expiradas";
                statusCode = HttpServletResponse.SC_FORBIDDEN; // 403
            }
            case InsufficientAuthenticationException insufficientAuthenticationException -> {
                errorMessage = "Autenticación insuficiente";
                statusCode = HttpServletResponse.SC_UNAUTHORIZED; // 401
            }
            case AuthenticationServiceException authenticationServiceException -> {
                errorMessage = "Error en el servicio de autenticación";
                statusCode = HttpServletResponse.SC_NOT_FOUND; // 404
            }
            default -> {
                errorMessage = "Error de autenticación: " + authException.getMessage();
                statusCode = HttpServletResponse.SC_UNAUTHORIZED;
            }
        }

        response.setStatus(statusCode);

        String respuestaJson = String.format(
                "{\"error\": \"%s\", \"status\": %d, \"path\": \"%s\"}",
                errorMessage,
                statusCode,
                request.getRequestURI()
        );

        response.getWriter().write(respuestaJson);
        response.getWriter().flush();
    }

}