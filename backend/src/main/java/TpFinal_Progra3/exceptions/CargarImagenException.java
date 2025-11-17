package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class CargarImagenException extends ResponseStatusException {
<<<<<<< HEAD
    public CargarImagenException(String message) {
        super(HttpStatus.BAD_GATEWAY, message);
    }
=======

    public CargarImagenException(String message) {super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, message);}
    public CargarImagenException(HttpStatus status, String mensaje){super(status, mensaje);}
>>>>>>> backup
}