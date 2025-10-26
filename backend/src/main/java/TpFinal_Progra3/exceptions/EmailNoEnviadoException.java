package TpFinal_Progra3.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class EmailNoEnviadoException extends RuntimeException {

  private HttpStatus status = null;

  public EmailNoEnviadoException(String message) {
    super(message);
  }
  public EmailNoEnviadoException(HttpStatus status,String message) {
    super(message);
    this.status = status;
  }

}
