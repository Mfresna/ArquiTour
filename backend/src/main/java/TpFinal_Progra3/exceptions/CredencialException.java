package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class CredencialException extends ResponseStatusException {
    public CredencialException(String mensaje) {
        super(HttpStatus.CONFLICT, mensaje);
    }
    public CredencialException(HttpStatus status, String mensaje) {
        super(status, mensaje);
    }
}
