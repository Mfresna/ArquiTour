package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class CargarImagenException extends ResponseStatusException {
    public CargarImagenException(String message) {
        super(HttpStatus.BAD_GATEWAY, message);
    }
}