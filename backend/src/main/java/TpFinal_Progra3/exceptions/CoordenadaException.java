package TpFinal_Progra3.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Getter
public class CoordenadaException extends RuntimeException {

    private HttpStatus status = null;

    public CoordenadaException(String message) {
        super(message);
    }
    public CoordenadaException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
