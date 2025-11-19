package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.DTO.filtros.UsuarioFiltroDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioBasicoDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.security.model.DTO.PasswordDTO;
import TpFinal_Progra3.security.model.DTO.RolesDTO;
import TpFinal_Progra3.security.model.enums.RolUsuario;
<<<<<<< HEAD
=======
import TpFinal_Progra3.services.implementacion.ImagenService;
>>>>>>> backup
import TpFinal_Progra3.services.implementacion.UsuarioService;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
<<<<<<< HEAD
=======
import org.springframework.web.multipart.MultipartFile;
>>>>>>> backup

import java.util.List;

/**
 * .requestMatchers(HttpMethod.POST"/usuarios").permitAll()
 * /usuarios/** => authenticated()
 */

@Tag(name = "Usuarios", description = "Gestión de usuarios, perfiles y seguridad")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(
            summary = "Registrar nuevo usuario",
            description = "Crea un nuevo usuario con los datos básicos y credenciales de acceso."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UsuarioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o email ya registrado", content = @Content),
    })
<<<<<<< HEAD
    @PostMapping
=======
    @PostMapping("/registrarme")
>>>>>>> backup
    public ResponseEntity<UsuarioResponseDTO> registrarUsuario(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos para registrar un nuevo usuario",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UsuarioDTO.class),
                            examples = @ExampleObject(name = "Ejemplo de usuario", value = """
                    {
                      "email": "usuario@correo.com",
                      "password": "Clave123",
                      "nombre": "Juan",
                      "apellido": "Pérez",
                      "fechaNacimiento": "1990-01-01",
                      "descripcion": "Arquitecto especializado en viviendas sustentables",
                      "imagenUrl": "https://miapp.com/img/perfil.png"
                    }
<<<<<<< HEAD
                """)
                    )
            )
            @RequestBody @Valid UsuarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrarUsuario(dto));
=======
                    """)
                    )
            )
            //@RequestBody @Valid UsuarioDTO dto
            @RequestPart("datosUsuario") UsuarioDTO datosUsuario,
            @RequestPart(value = "imagenPerfil", required = false) MultipartFile imagenPerfil) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.registrarUsuario(datosUsuario, imagenPerfil));
        
>>>>>>> backup
    }

    @Operation(summary = "Obtener usuario por ID", description = "Devuelve los datos públicos de un usuario según su ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado",
                    content = @Content(schema = @Schema(implementation = UsuarioResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtenerUsuario(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable @Positive Long id) {
        return ResponseEntity.ok(usuarioService.obtenerUsuario(id));
    }

    @Operation(summary = "Actualizar perfil del usuario", description = "Modifica el nombre, apellido, descripción, etc. del perfil.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "No autorizado a modificar este usuario")
    })
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> actualizarUsuario(HttpServletRequest request,
                                                                @PathVariable @Positive Long id,
                                                                @RequestBody @Valid UsuarioBasicoDTO usrDto) {
        //Actualiza solo el perfil del usuario regstrado
        return ResponseEntity.ok(usuarioService.modificarUsuario(request, id, usrDto));
    }

    @Operation(summary = "Actualizar imagen de perfil", description = "Permite cambiar la imagen de perfil del usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen actualizada correctamente"),
            @ApiResponse(responseCode = "400", description = "URL de imagen inválida")
    })
    @PatchMapping("/imagenPerfil")
    public ResponseEntity<UsuarioResponseDTO> actualizarImagenPerfil(HttpServletRequest request,
                                                                     @RequestBody @Valid ImagenDTO imgDTO){
        //Actualiza solo la imagen de perfil del usuario
        return ResponseEntity.ok(usuarioService.actualizarImagenPerfil(request, imgDTO.getUrl()));
    }

    @Operation(summary = "Eliminar imagen de perfil", description = "Permite eliminar la imagen de perfil del usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen eliminada correctamente"),
            @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    })
    @DeleteMapping("/imagenPerfil")
<<<<<<< HEAD
    public ResponseEntity<UsuarioResponseDTO> borrarImagenPerfil(HttpServletRequest request,
                                                                     @RequestBody @Valid ImagenDTO imgDTO){
        //Borrar solo la imagen de perfil del usuario
        return ResponseEntity.ok(usuarioService.borrarImagenPerfil(request, imgDTO.getUrl()));
=======
    public ResponseEntity<UsuarioResponseDTO> borrarImagenPerfil(HttpServletRequest request){

        //Borrar solo la imagen de perfil del usuario
        return ResponseEntity.ok(usuarioService.borrarImagenPerfil(request));
>>>>>>> backup
    }

    @Operation(summary = "Habilitar o inhabilitar cuenta", description = "Cambia el estado activo de la cuenta del usuario.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado de cuenta actualizado"),
            @ApiResponse(responseCode = "403", description = "Requiere permisos de administrador")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
<<<<<<< HEAD
    public ResponseEntity<String> cambiarEstadoDeCuenta(
=======
    public ResponseEntity<UsuarioResponseDTO> cambiarEstadoDeCuenta(
>>>>>>> backup
            HttpServletRequest request,
            @Parameter(description = "ID del usuario") @PathVariable @Positive Long id,
            @Parameter(description = "True para habilitar, False para inhabilitar") @RequestParam Boolean habilitacion) {
        if(habilitacion){
            return ResponseEntity.ok(usuarioService.habilitarCuenta(id, request));
        }else{
            return ResponseEntity.ok(usuarioService.inhabilitarCuenta(id, request));
        }
    }

    @Operation(summary = "Agregar roles a un usuario", description = "Permite asignar nuevos roles a un usuario existente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Roles asignados correctamente"),
            @ApiResponse(responseCode = "403", description = "Solo administradores pueden modificar roles")
    })
    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> agregarRoles(HttpServletRequest request,
                                                           @PathVariable @Positive Long id,
                                                           @RequestBody @Valid RolesDTO rolesDto) {
        return ResponseEntity.ok(usuarioService.agregarRoles(request, id, rolesDto));
    }   

    @Operation(summary = "Quitar roles a un usuario", description = "Elimina uno o más roles del usuario.")
    @DeleteMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponseDTO> quitarRoles(HttpServletRequest request,
                                                           @PathVariable @Positive Long id,
                                                           @RequestBody @Valid RolesDTO rolesDto) {
        return ResponseEntity.ok(usuarioService.quitarRoles(request, id, rolesDto));
    }

    @Operation(summary = "Filtrar usuarios", description = "Permite buscar usuarios por nombre, apellido, email, estado o rol.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuarios que coinciden con los filtros",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UsuarioResponseDTO.class))))
    })
    @GetMapping("/filtrar")
    public ResponseEntity<List<UsuarioResponseDTO>> filtrarUsuarios(
            @Parameter(description = "Filtrar por nombre") @RequestParam(required = false) String nombre,
            @Parameter(description = "Filtrar por apellido") @RequestParam(required = false) String apellido,
            @Parameter(description = "Filtrar por email") @RequestParam(required = false) String email,
            @Parameter(description = "Filtrar por estado activo") @RequestParam(required = false) Boolean isActivo,
            @Parameter(description = "Filtrar por rol") @RequestParam(required = false) RolUsuario rol) {

        UsuarioFiltroDTO filtro = new UsuarioFiltroDTO();
        filtro.setNombre(nombre);
        filtro.setApellido(apellido);
        filtro.setEmail(email);
        filtro.setIsActivo(isActivo);
        filtro.setRol(rol);

        return ResponseEntity.ok(usuarioService.filtrarUsuarios(filtro));
    }

    @Operation(summary = "Obtener mi perfil", description = "Devuelve los datos del usuario autenticado actualmente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponseDTO> obtenerMiPerfil(HttpServletRequest request) {
        return ResponseEntity.ok(usuarioService.obtenerMiPerfil(request));
    }

    @Operation(summary = "Cambiar contraseña", description = "Permite al usuario autenticado actualizar su contraseña.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contraseña cambiada correctamente"),
            @ApiResponse(responseCode = "400", description = "Contraseña inválida"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
<<<<<<< HEAD
    public ResponseEntity<String> cambiarPassword(HttpServletRequest request,
                                                  @RequestBody @Valid PasswordDTO passDTO) {
        Usuario usr = usuarioService.buscarUsuario(usuarioService.obtenerMiPerfil(request).getId());
        return ResponseEntity.ok(usuarioService.cambiarPassword(usr, passDTO));
=======
    public ResponseEntity<Void> cambiarPassword(HttpServletRequest request,
                                                  @RequestBody @Valid PasswordDTO passDTO) {
        Usuario usr = usuarioService.buscarUsuario(usuarioService.obtenerMiPerfil(request).getId());
        usuarioService.cambiarPassword(usr, passDTO);
        return ResponseEntity.ok().build();
>>>>>>> backup
    }

}
