package TpFinal_Progra3.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class ValidacionPinException extends ResponseStatusException {

  public ValidacionPinException(String message) {super(HttpStatus.CONFLICT, message);}
  public ValidacionPinException(HttpStatus status, String mensaje){super(status, mensaje);}
}