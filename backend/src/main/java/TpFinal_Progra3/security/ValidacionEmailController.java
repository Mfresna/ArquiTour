package TpFinal_Progra3.security;


import TpFinal_Progra3.model.DTO.usuarios.UsuarioDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.security.model.DTO.PinRequestDTO;
import TpFinal_Progra3.security.model.DTO.PinValidarDTO;
import TpFinal_Progra3.security.services.ValidacionEmailService;
import TpFinal_Progra3.services.implementacion.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/validacion")
@RequiredArgsConstructor
public class ValidacionEmailController {

    private final ValidacionEmailService validacionEmailService;

    @PostMapping("/enviarPin")
    public ResponseEntity<String> enviarPIN(@RequestBody @Valid PinRequestDTO dto){
        validacionEmailService.enviarPIN(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Se envió un PIN de verificación al correo " + dto.email().trim().toLowerCase());

    }

    @PostMapping("/verificarPin")
    public ResponseEntity<PinRequestDTO> validarPIN(@RequestBody @Valid PinValidarDTO dto){
        return ResponseEntity.ok().body(validacionEmailService.validarPIN(dto));
    }

}
