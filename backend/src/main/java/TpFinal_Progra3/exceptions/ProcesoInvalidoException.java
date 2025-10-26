package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class ProcesoInvalidoException extends ResponseStatusException {
    public ProcesoInvalidoException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
    public ProcesoInvalidoException(HttpStatus status, String mensaje) {
        super(status, mensaje);
    }
}
