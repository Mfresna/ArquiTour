package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.IPLocationException;
import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.CoordenadasDTO;
import TpFinal_Progra3.model.DTO.IPLocationDTO;
import TpFinal_Progra3.model.DTO.obras.ObraDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.model.entities.EstudioArq;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.Obra;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.mappers.ObraMapper;
import TpFinal_Progra3.repositories.EstudioArqRepository;
import TpFinal_Progra3.repositories.ObraRepository;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import TpFinal_Progra3.services.IPLocationService;
import TpFinal_Progra3.services.OpenStreetMapService;
import TpFinal_Progra3.services.interfaces.ObraServiceInterface;
import TpFinal_Progra3.specifications.ObraSpecification;
import TpFinal_Progra3.model.DTO.filtros.ObraFiltroDTO;
import TpFinal_Progra3.utils.CoordenadasUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ObraService implements ObraServiceInterface{

    private final ObraRepository obraRepository;
    private final EstudioArqRepository estudioArqRepository;
    private final ObraMapper obraMapper;
    private final OpenStreetMapService openStreetMapService;
    private final IPLocationService ipLocationService;
    private final ImagenService imagenService;
    private final UsuarioService usuarioService;

    public ObraResponseDTO crearObra(HttpServletRequest request, ObraDTO dto) {
        EstudioArq estudio = estudioArqRepository.findById(dto.getEstudioId())
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado"));

        if(!puedeGestionarObra(request, dto.getEstudioId())) {
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede crear obras para un estudio que no forma parte.");
        }

        //Modificacion 10-11
        if(!obraRepository.findByNombreIgnoreCase(dto.getNombre()).isEmpty()){
            throw new ProcesoInvalidoException(HttpStatus.NOT_ACCEPTABLE,"No se puede crear una obra que contenta ese nombre.");
        }

        List<Imagen> imagenesObra = dto.getUrlsImagenes().stream()
                .map(imagenService::obtenerImagen)
                .toList();

        Obra obraGuardada = obraRepository.save(obraMapper.mapObra(dto,estudio,imagenesObra));

        return obraMapper.mapResponseDTO(obraGuardada);
    }

    public ObraResponseDTO obtenerObraResponseDTO(Long id) {
        return obraMapper.mapResponseDTO(obtenerObra(id));
    }

    public void eliminarObra(HttpServletRequest request,Long id) throws NotFoundException {
        if (!obraRepository.existsById(id)) {
            throw new NotFoundException("Obra no encontrada.");
        }

        if(!puedeGestionarObra(request,id)) {
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede eliminar obras para un estudio que no forma parte.");
        }

        obraRepository.deleteById(id);
    }

    public String obraEnMapa(int zoom, Long id)throws NotFoundException{
        Obra obra = obraRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id));

        return openStreetMapService.generarMapaConMarcador(obra.getLatitud(), obra.getLongitud(), zoom);
    }

    public List<ObraResponseDTO> obrasPorTerritorio(String ciudad, String pais){
        Map<String, Double> coordenadas = openStreetMapService.areaDeCiudadPais(ciudad,pais);

        return obraRepository.findByLatitudBetweenAndLongitudBetween(
                        coordenadas.get("latMin"),
                        coordenadas.get("latMax"),
                        coordenadas.get("lonMin"),
                        coordenadas.get("lonMax"))
                .stream()
                .map(obraMapper::mapResponseDTO)
                .toList();
    }

    public List<ObraResponseDTO> obrasPorDistancia(HttpServletRequest request, Double distancia, CoordenadasDTO coordNavegador){

        IPLocationDTO ipLocationUsuario;

        if(coordNavegador != null && CoordenadasUtils.validarCoordenadas(coordNavegador.getLatitud(),coordNavegador.getLongitud()) == 0){
            //coordNavegador no es null y las coordenadas son validas
            ipLocationUsuario = IPLocationDTO.builder().ip("0")
                    .latitud(coordNavegador.getLatitud())
                    .longitud(coordNavegador.getLongitud())
                    .build();
        }else {
            ipLocationUsuario =
                    ipLocationService.obtenerUbicacion(ipLocationService.obtenerIpCliente(request))
                            .orElseThrow(() -> new IPLocationException(HttpStatus.CONFLICT,"No se puede obtener la Localizacion por IP"));
        }

        Map<String,Double> coordenadas = CoordenadasUtils.areaDeBusqueda(ipLocationUsuario, distancia);

        return obraRepository.findByLatitudBetweenAndLongitudBetween(
                        coordenadas.get("latMin"),
                        coordenadas.get("latMax"),
                        coordenadas.get("lonMin"),
                        coordenadas.get("lonMax"))
                .stream()
                .map(obraMapper::mapResponseDTO)
                .toList();
    }

    public List<ObraResponseDTO> filtrarObras(ObraFiltroDTO filtro) {

        // Verificar existencia del estudio
        if (filtro.getEstudioId() != null) {
            boolean existeEstudio = estudioArqRepository.existsById(filtro.getEstudioId());
            if (!existeEstudio) {
                throw new NotFoundException("El estudio de arquitectura con ID " + filtro.getEstudioId() + " no existe.");
            }
        }

        // Aplicar los filtro y Mapear resultados
        return obraRepository.findAll(ObraSpecification.filtrar(filtro))
                .stream()
                .map(obraMapper::mapResponseDTO)
                .toList();
    }

    public ObraResponseDTO modificarObra(HttpServletRequest request, Long id, ObraDTO obraDTO) {
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id));

        EstudioArq estudio = estudioArqRepository.findById(obraDTO.getEstudioId())
                .orElseThrow(() -> new NotFoundException("Estudio de arquitectura no encontrado con ID: " + obraDTO.getEstudioId()));

        if(!puedeGestionarObra(request,id)) {
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede modificar obras para un estudio que no forma parte.");
        }

        obra.setNombre(obraDTO.getNombre());
        obra.setLatitud(obraDTO.getLatitud());
        obra.setLongitud(obraDTO.getLongitud());
        obra.setDescripcion(obraDTO.getDescripcion());
        obra.setAnioEstado(obraDTO.getAnioEstado());
        obra.setEstado(obraDTO.getEstado());
        obra.setCategoria(obraDTO.getCategoria());
        obra.setEstudio(estudio);

        Obra obraActualizada = obraRepository.save(obra);
        return obraMapper.mapResponseDTO(obraActualizada);
    }

    public List<Imagen> listarImagenes(Long id){
        return obraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id))
                .getImagenes();
    }

    public void eliminarImagenes(HttpServletRequest request, Long id, List<String> urlImagenes){
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id));

        if(!puedeGestionarObra(request,id)){
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede eliminar imagenes de obras para un estudio que no forma parte.");
        }

        obra.getImagenes().removeIf(imagen -> urlImagenes.contains(imagen.getUrl()));

        obraRepository.save(obra);
    }

    public ObraResponseDTO agregarImagenes(HttpServletRequest request, Long id, List<String> urlImagenes){
        Obra obra = obraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id));

        if(!puedeGestionarObra(request,id)){
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede agregar imagenes de obras para un estudio que no forma parte.");
        }

        obra.getImagenes().addAll(urlImagenes.stream()
                .map(imagenService::obtenerImagen)
                .toList());

        return obraMapper.mapResponseDTO(obraRepository.save(obra));
    }

    public List<Obra> obtenerObrasPorIds(List<Long> ids) {
        return ids.stream()
                .map(id -> obraRepository.findById(id)
                        .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id)))
                .toList();
    }

    public Obra obtenerObra(Long id) {
        return obraRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Obra no encontrada con ID: " + id));
    }

    private boolean puedeGestionarObra(HttpServletRequest request, Long id){
        Usuario usr = usuarioService.buscarUsuario(request);

        return usr.getCredencial().tieneRolUsuario(RolUsuario.ROLE_ADMINISTRADOR)
                || usr.getEstudios().stream().anyMatch(e -> e.getId().equals(id));
    }
}
