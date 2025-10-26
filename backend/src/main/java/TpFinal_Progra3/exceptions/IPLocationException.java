package TpFinal_Progra3.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class IPLocationException extends RuntimeException {

    private HttpStatus status = null;

    public IPLocationException(String message) {
        super(message);
    }
    public IPLocationException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
