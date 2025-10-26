package TpFinal_Progra3.exceptions;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;


import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailNoEnviadoException.class)
    public ResponseEntity<String> handlerEnvioEmail(EmailNoEnviadoException e) {
        if(e.getStatus() != null){
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
    }

    @ExceptionHandler(CoordenadaException.class)
    public ResponseEntity<String> handlerCoordenadasinvalidas(CoordenadaException e) {
        if(e.getStatus() != null){
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(IPLocationException.class)
    public ResponseEntity<String> handlerIPLocation(IPLocationException e) {
        if(e.getStatus() != null){
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<String> handleNotFoundException(NotFoundException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
    }

    @ExceptionHandler(CargarImagenException.class)
    public ResponseEntity<String> handlerCargarImagenException(CargarImagenException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
    }

    // Manejo de excepciones para errores en el cuerpo de la solicitud
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleHttpMessageNotReadable(HttpMessageNotReadableException e) {
        if (e.getCause() instanceof InvalidFormatException formatException) {
            Class<?> targetType = formatException.getTargetType();
            Object valorIngresado = formatException.getValue();

            if (targetType.isEnum()) {
                List<String> valoresPermitidos = Arrays.stream(targetType.getEnumConstants())
                        .map(v -> ((Enum<?>) v).name())
                        .toList();

                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Valor inválido para campo tipo " + targetType.getSimpleName(),
                        "valorRecibido", String.valueOf(valorIngresado),
                        "valoresPermitidos", String.join(", ", valoresPermitidos)
                ));
            }
        }

        return ResponseEntity.badRequest().body(Map.of(
                "error", "Error en el cuerpo de la solicitud",
                "detalle", e.getMessage()
        ));
    }

    // Manejo de excepciones para errores de conversión de enum pasados por url
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleEnumConversionError(MethodArgumentTypeMismatchException ex) {
        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            //Obtiene el nombre de enum que se intenta cargar
            String nombreEnum = ex.getRequiredType().getSimpleName();
            //Valor que se intenta cargar en el DTO
            String valorIngresado = String.valueOf(ex.getValue());

            String valoresPermitidos = Arrays.stream(ex.getRequiredType().getEnumConstants())
                    .map(e -> ((Enum<?>) e).name())
                    .collect(Collectors.joining(", "));

            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Valor inválido para parámetro tipo " + nombreEnum,
                    "valorRecibido", valorIngresado,
                    "valoresPermitidos", valoresPermitidos));
        }

        // Si no es un enum, se maneja como un error genérico de tipo de argumento
        return ResponseEntity.badRequest().body(Map.of(
                "error", "Parámetro inválido",
                "detalle", ex.getMessage()));
    }

   // Detecta y maneja las excepciones de Valid en los DTO
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errores = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errores.put(error.getField(), error.getDefaultMessage());
        });

        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("status", HttpStatus.BAD_REQUEST.value());
        cuerpo.put("error", "Error de validación");
        cuerpo.put("path", request.getRequestURI());
        cuerpo.put("timestamp", LocalDateTime.now());
        cuerpo.put("mensajes", errores);

        return ResponseEntity.badRequest().body(cuerpo);
    }

    // Manejo de excepciones para conflictos, como al intentar creaar un usuario con un email ya existente
    @ExceptionHandler(CredencialException.class)
    public ResponseEntity<String> handleCredencial(CredencialException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(ProcesoInvalidoException.class)
    public ResponseEntity<String> handlerProcesos(ProcesoInvalidoException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
    }

    @ExceptionHandler(BorradoException.class)
    public ResponseEntity<String> handlerBorradoException(BorradoException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getMessage());
    }

}



