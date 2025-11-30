package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.services.implementacion.ImagenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Tag(name = "Imágenes", description = "Gestión de imágenes del sistema")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/imagenes")
@RequiredArgsConstructor
public class ImagenController {

    private final ImagenService imagenService;


    @Operation(
            summary = "Obtener imagen por ID",
            description = "Recupera una imagen específica por su identificador"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen encontrada",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ImagenDTO.class))),
            @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ImagenDTO> obtenerImagen(
            @Parameter(description = "ID de la imagen", required = true)
            @PathVariable @Positive Long id) {
        return ResponseEntity.ok(imagenService.obtenerImagen(id));
    }

    @Operation(
            summary = "Eliminar imagen",
            description = "Elimina una imagen del sistema (requiere rol ADMINISTRADOR)"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imagen eliminada correctamente"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @ApiResponse(responseCode = "404", description = "Imagen no encontrada")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminarImagen(
            @Parameter(description = "ID de la imagen a eliminar", required = true)
            @PathVariable @Positive Long id) {
        imagenService.eliminarImagen(id);
        return ResponseEntity.ok().build();
    }

    @Operation(
            summary = "Subir imágenes",
            description = "Carga múltiples imágenes y devuelve sus URLs"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Imágenes subidas exitosamente",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Error al procesar archivos")
    })
    @PostMapping("/subir")
    public ResponseEntity<List<String>> subirImagenes(
            @Parameter(description = "Lista de archivos de imagen", required = true)
            @RequestParam("archivos") List<MultipartFile> archivos){
        return ResponseEntity.ok(imagenService.subirImagenes(archivos));
    }

    @PostMapping("/subir-mixto")
    public ResponseEntity<List<String>> subirArchivosMixtos(
            @RequestParam("archivos") List<MultipartFile> archivos
    ) {
        // Usa tu nuevo método del service que maneja PDFs + imágenes
        List<Imagen> imagenes = imagenService.subirArchivosMixtos(archivos);

        // Del resultado sacamos solo las URLs, como en /subir
        List<String> urls = imagenes.stream()
                .map(Imagen::getUrl)
                .toList();

        return ResponseEntity.ok(urls);
    }


}