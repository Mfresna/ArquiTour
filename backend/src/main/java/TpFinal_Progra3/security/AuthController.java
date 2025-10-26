package TpFinal_Progra3.security;

import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.security.model.DTO.AuthRequest;
import TpFinal_Progra3.security.model.DTO.AuthResponse;
import TpFinal_Progra3.security.model.DTO.EmailDTO;
import TpFinal_Progra3.security.model.DTO.PasswordDTO;
import TpFinal_Progra3.security.services.AuthService;
import TpFinal_Progra3.security.services.JwtService;
import TpFinal_Progra3.security.services.UserDetailsService;
import TpFinal_Progra3.services.EmailService;
import TpFinal_Progra3.services.implementacion.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Autenticación", description = "Manejo de login, recuperación y cambio de contraseña")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;
    private final EmailService emailService;

    //Recibe por PostMan un AuthRequest con USR y PASS
    @Operation(summary = "Autenticar usuario", description = "Devuelve un token JWT si las credenciales son válidas.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Autenticación exitosa",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(
            @RequestBody @Valid @Parameter(description = "Credenciales de usuario") AuthRequest authRequest){
        UserDetails usuario = authService.authenticate(authRequest);
        String token = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @Operation(summary = "Solicitar restablecimiento de contraseña",
            description = "Envía un email con un enlace para restablecer la contraseña si el usuario está activo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Correo enviado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Email inválido", content = @Content)
    })
    @PostMapping("/password")
    public ResponseEntity<String> olvidePassword(
            @RequestBody @Valid  @Parameter(description = "Email del usuario registrado") EmailDTO emailDTO){
        //Solo los usuarios isActivos pueden generar token de restauracion (está en JWT)
        String token = jwtService.generarToken(usuarioService.buscarUsuario(emailDTO.getEmail()));
        emailService.mailResetPass(emailDTO.getEmail(),token);

        return ResponseEntity.ok("Ingrese a su correo electronico y siga los pasos: " + emailDTO.getEmail());
    }

    @Operation(summary = "Restaurar contraseña", description = "Permite establecer una nueva contraseña utilizando un token de recuperación.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Contraseña cambiada exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado", content = @Content),
            @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content)
    })
    @PatchMapping("/password/{token}")
    public ResponseEntity<String> restaurarPassword(
            @Parameter(description = "Token de recuperación enviado por correo") @PathVariable String token,
            @RequestBody @Valid @Parameter(description = "Nueva contraseña") PasswordDTO passDTO){
        if (!jwtService.isTokenValid(token)){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("");
        }

        Usuario usr = usuarioService.buscarUsuario(jwtService.extractUsername(token));

        return ResponseEntity.ok(usuarioService.cambiarPassword(usr,passDTO));
    }

}
