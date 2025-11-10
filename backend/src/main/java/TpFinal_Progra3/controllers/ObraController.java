package TpFinal_Progra3.controllers;

import TpFinal_Progra3.model.DTO.CoordenadasDTO;
import TpFinal_Progra3.model.DTO.obras.ObraDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.DTO.filtros.ObraFiltroDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import TpFinal_Progra3.services.implementacion.ObraService;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Map;

@Tag(name = "Obras", description = "Gestión de obras arquitectónicas")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/obras")
@RequiredArgsConstructor
public class ObraController {

    private final ObraService obraService;

    @Operation(summary = "Crear una nueva obra")
    @ApiResponse(responseCode = "201", description = "Obra creada correctamente")
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<ObraResponseDTO> crearObra(
            HttpServletRequest request,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Datos de la obra",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ObraDTO.class),
                            examples = @ExampleObject(
                                    name = "Ejemplo de obra",
                                    value = """
                        {
                          "nombre": "Museo de Arte Moderno",
                          "latitud": -34.6037,
                          "longitud": -58.3816,
                          "descripcion": "Obra icónica de arquitectura moderna ubicada en Buenos Aires.",
                          "anioEstado": 2020,
                          "estado": "FINALIZADA",
                          "categoria": "ARQ_CULTURAL",
                          "estudioId": 1,
                          "urlsImagenes": [
                            "https://miapp.com/img/obra1.jpg",
                            "https://miapp.com/img/obra2.jpg"
                          ]
                        }
                        """
                            )
                    )
            )
            @RequestBody @Valid ObraDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(obraService.crearObra(request,dto));
    }

    @Operation(summary = "Obtener una obra por ID")
    @GetMapping("/{id}")
    public ResponseEntity<ObraResponseDTO> obtenerObra(
            @Parameter(description = "ID de la obra") @PathVariable @Positive Long id) {
        return ResponseEntity.ok(obraService.obtenerObraResponseDTO(id));
    }

    @Operation(summary = "Eliminar una obra")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<Void> eliminarObra(
            HttpServletRequest request,
            @Parameter(description = "ID de la obra a eliminar") @PathVariable @Positive Long id) {
        obraService.eliminarObra(request, id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Obtener URL de visualización de obra en mapa")
    @GetMapping("/mapa/{id}")
    public ResponseEntity<Map<String,String>> obraEnMapa(
            @Parameter(description = "ID de la obra") @PathVariable @Positive Long id,
            @Parameter(description = "Nivel de zoom (1-19)") @RequestParam(defaultValue = "16") @Min(1) @Max(19) int zoom) {
        return ResponseEntity.ok(Map.of("url", obraService.obraEnMapa(zoom,id)));
    }

    @Operation(summary = "Listar obras por país y ciudad")
    @GetMapping("/area")
    public ResponseEntity<List<ObraResponseDTO>> obrasPorTerritorio(
            @Parameter(description = "Nombre de la ciudad") @RequestParam(required = false) String ciudad,
            @Parameter(description = "Nombre del país") @RequestParam String pais){
        return ResponseEntity.ok(obraService.obrasPorTerritorio(ciudad,pais));
    }

    //Key: X-Forwarded-For - Value: mi ip publica

    //GET http://localhost:8080/api/obras/cercanas?distanciaKm=25  &lat=-34.6037&lon=-58.3816  (Opcionales)
    @Operation(summary = "Listar obras cercanas al usuario")
    @PostMapping("/cercanas")
    public ResponseEntity<List<ObraResponseDTO>> obrasPorDistancia(
            HttpServletRequest request,
            @Parameter(description = "Distancia máxima en km") @RequestParam(defaultValue = "25") @Positive Double distanciaKm,
            @RequestBody(required = false) @Valid CoordenadasDTO coordenadasNavegador){

        return ResponseEntity.ok(obraService.obrasPorDistancia(request, distanciaKm, coordenadasNavegador));
    }

    @Operation(summary = "Filtrar obras por categoría, estado y estudio")
    @GetMapping("/filtrar")
    public ResponseEntity<List<ObraResponseDTO>> filtrarObras(
            @Parameter(description = "Categoría de la obra")
            @RequestParam(required = false) CategoriaObra categoria,
            @Parameter(description = "Estado de la obra")
            @RequestParam(required = false) EstadoObra estado,
            @Parameter(description = "ID del estudio")
            @RequestParam(required = false) @Positive Long estudioId,
            @Parameter(description = "Nombre de la obra (parcial o completo)")
            @RequestParam(required = false) String nombre) {

        ObraFiltroDTO filtro = new ObraFiltroDTO();
        filtro.setCategoria(categoria);
        filtro.setEstado(estado);
        filtro.setEstudioId(estudioId);
        filtro.setNombre(nombre);

        return ResponseEntity.ok(obraService.filtrarObras(filtro));
    }

    @Operation(summary = "Actualizar una obra existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<ObraResponseDTO> actualizarObra(
            HttpServletRequest request,
            @Parameter(description = "ID de la obra a actualizar") @PathVariable @Positive Long id,
            @RequestBody @Valid ObraDTO obraDTO) {
        return ResponseEntity.ok(obraService.modificarObra(request, id, obraDTO));
    }

    //---------------IMAGENES----------------

    @Operation(summary = "Listar imágenes asociadas a una obra")
    @GetMapping("/{id}/imagenes")
    public ResponseEntity<List<Imagen>> listarImagenes(
            @Parameter(description = "ID de la obra") @PathVariable @Positive Long id){
        return ResponseEntity.ok(obraService.listarImagenes(id));
    }

    @Operation(summary = "Eliminar imágenes de una obra")
    @DeleteMapping("/{id}/imagenes")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<Void> eliminarImagenes(
            HttpServletRequest request,
            @Parameter(description = "ID de la obra") @PathVariable @Positive Long id,
            @RequestBody List<@Pattern(regexp = "^(https?://).+\\.(jpg|jpeg|png|gif|bmp|webp)$") String> urlBorrar) {
        obraService.eliminarImagenes(request, id,urlBorrar);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Agregar imágenes a una obra")
    @PutMapping("/{id}/imagenes")
    @PreAuthorize("hasRole('ADMINISTRADOR') or hasRole('ARQUITECTO')")
    public ResponseEntity<ObraResponseDTO> agregarImagenes(
            HttpServletRequest request,
            @Parameter(description = "ID de la obra") @PathVariable @Positive Long id,
            @RequestBody List< String> urlAgregar) {
        return ResponseEntity.ok(obraService.agregarImagenes(request, id, urlAgregar));
    }

}
