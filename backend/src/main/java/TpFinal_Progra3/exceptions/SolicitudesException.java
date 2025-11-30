package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class SolicitudesException extends ResponseStatusException {
    public SolicitudesException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
    public SolicitudesException(HttpStatus status, String mensaje) {
        super(status, mensaje);
    }
}
