package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class BorradoException extends ResponseStatusException {
  public BorradoException(String message) {super(HttpStatus.NO_CONTENT, message);}
  public BorradoException(HttpStatus status, String mensaje){super(status, mensaje);}
}
