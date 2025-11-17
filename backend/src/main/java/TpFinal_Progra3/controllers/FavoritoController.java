package TpFinal_Progra3.controllers;

import TpFinal_Progra3.exceptions.BorradoException;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoBasicoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoDTO;
import TpFinal_Progra3.model.DTO.favoritos.FavoritoResponseDTO;
import TpFinal_Progra3.model.DTO.favoritos.RenombrarFavoritoDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.services.implementacion.FavoritoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;

import java.util.List;

@Tag(name = "Favoritos", description = "Gestión de listas de favoritos de obras")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    // 1. Crear o actualizar una lista de favoritos
    @Operation(summary = "Crear o actualizar una lista de favoritos")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Lista creada exitosamente"),
            @ApiResponse(responseCode = "200", description = "Lista actualizada correctamente")
    })
    @PostMapping
    public ResponseEntity<FavoritoResponseDTO> crearOActualizarFavorito(
            HttpServletRequest request,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Cuerpo con el nombre de la lista y las obras",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = FavoritoDTO.class),
                            examples = @ExampleObject(
                                    name = "Ejemplo de favorito",
                                    value = """
                        {
                          "nombreLista": "Mis obras favoritas",
                          "idObras": [1, 2, 3]
                        }
                        """
                            )
                    )
            )
            @RequestBody @Valid FavoritoDTO dto) {
        FavoritoService.ResultadoFavorito resultado = favoritoService.crearOActualizarFavorito(request, dto);

        return resultado.esNuevo()
                ? ResponseEntity.status(HttpStatus.CREATED).body(resultado.dto())
                : ResponseEntity.ok(resultado.dto());
    }

    // 2. Obtener todas las listas del usuario
    @Operation(summary = "Obtener todas las listas de favoritos del usuario")
    @ApiResponse(responseCode = "200", description = "Listas de favoritos del usuario")
    @GetMapping
    public ResponseEntity<List<FavoritoBasicoDTO>> obtenerFavoritosDelUsuario(HttpServletRequest request) {
        return ResponseEntity.ok(favoritoService.obtenerFavoritosDelUsuario(request));
    }

    // 3. Obtener las obras de una lista específica
    @Operation(summary = "Obtener obras de una lista de favoritos")
    @ApiResponse(responseCode = "200", description = "Obras encontradas en el favorito")
    @GetMapping("/{id}/obras")
    public ResponseEntity<List<ObraResponseDTO>> listarObrasDeFavorito(HttpServletRequest request,
                                                                       @Parameter(description = "ID de la lista de favoritos", required = true)
                                                                       @PathVariable @Positive Long id) {
        return ResponseEntity.ok(favoritoService.listarObrasDeFavorito(request, id));
    }

    // 4. Agregar obras a una lista existente
    @Operation(summary = "Agregar obra a un favorito existente")
    @ApiResponse(responseCode = "200", description = "Obra agregada correctamente")
    @PatchMapping("/{id}/obras/{obraId}")
    public ResponseEntity<FavoritoResponseDTO> agregarObraAFavorito(HttpServletRequest request,
                                                                    @Parameter(description = "ID de la lista de favoritos") @PathVariable @Positive Long id,
                                                                    @Parameter(description = "ID de la obra a agregar") @PathVariable @Positive Long obraId) {
        return ResponseEntity.ok(favoritoService.agregarObraAFavorito(request, id, obraId));
    }

    // 5. Eliminar una obra de una lista
    @Operation(summary = "Eliminar una obra de un favorito")
    @ApiResponse(responseCode = "200", description = "Obra eliminada de la lista")
    @DeleteMapping("/{id}/obras/{obraId}")
    public ResponseEntity<FavoritoResponseDTO> eliminarObraDeFavorito(HttpServletRequest request,
                                                                      @Parameter(description = "ID de la lista") @PathVariable @Positive Long id,
                                                                      @Parameter(description = "ID de la obra a eliminar") @PathVariable @Positive Long obraId) {

        return ResponseEntity.ok(favoritoService.eliminarObraDeFavoritoPorId(request, id, obraId));
    }

    // 6. Renombrar Favorito
    @Operation(summary = "Renombrar una lista de favoritos")
    @ApiResponse(responseCode = "200", description = "Nombre de lista actualizado")
    @PatchMapping("/{id}/renombrar")
    public ResponseEntity<FavoritoResponseDTO> renombrarFavorito(
            HttpServletRequest request,
            @Parameter(description = "ID del favorito a renombrar") @PathVariable @Positive Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Nuevo nombre para la lista de favoritos",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = RenombrarFavoritoDTO.class),
                            examples = @ExampleObject(
                                    name = "Ejemplo renombrar favorito",
                                    value = """
                        {
                          "nuevoNombre": "Obras argentinas"
                        }
                        """
                            )
                    )
            )
            @RequestBody @Valid RenombrarFavoritoDTO dto) {
        return ResponseEntity.ok(favoritoService.renombrarFavoritoPorId(request, id, dto.getNuevoNombre()));
    }


    // 7. Eliminar una lista completa de favoritos
    @Operation(summary = "Eliminar una lista de favoritos")
    @ApiResponse(responseCode = "200", description = "Lista eliminada exitosamente")
    @DeleteMapping("/{id}")
<<<<<<< HEAD
    public ResponseEntity<String> eliminarFavorito(HttpServletRequest request,
                                                   @Parameter(description = "ID de la lista de favoritos a eliminar") @PathVariable @Positive Long id){
        return ResponseEntity.ok( favoritoService.eliminarFavoritoPorId(request, id));
=======
    public ResponseEntity<Void> eliminarFavorito(HttpServletRequest request,
                                                   @Parameter(description = "ID de la lista de favoritos a eliminar") @PathVariable @Positive Long id){
        favoritoService.eliminarFavoritoPorId(request, id);
        return ResponseEntity.ok().build();
>>>>>>> backup
    }
}

