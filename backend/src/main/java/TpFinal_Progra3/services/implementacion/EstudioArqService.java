package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.DTO.estudios.EstudioArqBasicoDTO;
import TpFinal_Progra3.model.DTO.estudios.EstudioArqDTO;
import TpFinal_Progra3.model.DTO.filtros.EstudioArqFiltroDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.model.entities.EstudioArq;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.model.mappers.EstudioArqMapper;
import TpFinal_Progra3.repositories.EstudioArqRepository;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import TpFinal_Progra3.services.interfaces.EstudioArqServiceInterface;
import TpFinal_Progra3.specifications.EstudioArqSpecification;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EstudioArqService implements EstudioArqServiceInterface {

    private final EstudioArqRepository estudioArqRepository;
    private final EstudioArqMapper estudioArqMapper;
    private final ImagenService imagenService;
    private final UsuarioService usuarioService;

    @Transactional
    public EstudioArqDTO crearEstudio(HttpServletRequest request, EstudioArqBasicoDTO dto){
        Imagen img = null;
        if(dto.getImagenUrl() != null){
            img = imagenService.obtenerImagen(dto.getImagenUrl());
        }

        EstudioArq estudioArq = estudioArqMapper.mapEstudio(dto, img);
        estudioArqRepository.save(estudioArq);

        if(!usuarioService.buscarUsuario(request)
                .getCredencial().tieneRolUsuario(RolUsuario.ROLE_ADMINISTRADOR)){
            //SI ES ARQUITECTO LE GUARDO EL ESTUDIO
            Usuario usr = usuarioService.buscarUsuario(request);
            usr.getEstudios().add(estudioArq);
            usuarioService.guardarUsuario(usr);
        }

        return estudioArqMapper.mapDTO(estudioArq);
    }

    @Transactional
    public void eliminarEstudio(Long id) {
        EstudioArq estudio = estudioArqRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado con ID: " + id));

        if (estudio.getObras() != null && !estudio.getObras().isEmpty()) {
            throw new ProcesoInvalidoException("No se puede eliminar el estudio porque tiene obras asignadas.");
        }

        estudioArqRepository.delete(estudio);
    }

    public EstudioArqDTO obtenerEstudio(Long id) {
        return estudioArqRepository.findById(id)
                .map(estudioArqMapper::mapDTO)
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado con ID: " + id));
    }

    public List<EstudioArqDTO> filtrarEstudios(EstudioArqFiltroDTO filtro) {
        List<EstudioArq> estudiosFiltrados = estudioArqRepository.findAll(EstudioArqSpecification.filtrar(filtro));

        if (estudiosFiltrados.isEmpty()) {
            throw new NotFoundException("No se encontraron estudios con los filtros especificados.");
        }

        return estudiosFiltrados.stream()
                .map(estudioArqMapper::mapDTO)
                .toList();
    }

    @Transactional
    public EstudioArqDTO agregarArquitectoAEstudio(HttpServletRequest request, Long estudioId, Long arquitectoId) {
        EstudioArq estudio = estudioArqRepository.findById(estudioId)
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado con ID: " + estudioId));

        if(!puedeGestionarEstudio(request,estudioId)){
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede agregar a otros Arquitectos a un estudio del que no forma parte");
        }

        Usuario arquitecto = usuarioService.buscarUsuario(arquitectoId);

        // Validar que el usuario esté activo
        if (!arquitecto.getIsActivo()) {
            throw new ProcesoInvalidoException("El usuario no está activo.");
        }

        // Validar que tenga el rol de ARQUITECTO
        if (!arquitecto.getCredencial().tieneRolUsuario(RolUsuario.ROLE_ADMINISTRADOR)){
            throw new ProcesoInvalidoException("El usuario no tiene el rol de ARQUITECTO.");
        }

        // Agregar el arquitecto si no está ya presente
        if (!estudio.getArquitectos().contains(arquitecto)) {
            estudio.getArquitectos().add(arquitecto);
            estudioArqRepository.save(estudio);
        }

        return estudioArqMapper.mapDTO(estudio);
    }

    @Transactional
    public EstudioArqDTO eliminarArquitectoDeEstudio(HttpServletRequest request,Long estudioId, Long arquitectoId) {
        EstudioArq estudio = estudioArqRepository.findById(estudioId)
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado con ID: " + estudioId));

        if(!puedeGestionarEstudio(request,estudioId)){
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,"El Arquitecto no puede agregar a otros Arquitectos a un estudio del que no forma parte");
        }

        Usuario arquitecto = usuarioService.buscarUsuario(arquitectoId);

        // Validar que el arquitecto pertenezca al estudio
        if (!estudio.getArquitectos().contains(arquitecto)) {
            throw new ProcesoInvalidoException("El usuario no pertenece a este estudio.");
        }

        // Eliminar arquitecto
        estudio.getArquitectos().remove(arquitecto);
        estudioArqRepository.save(estudio);

        return estudioArqMapper.mapDTO(estudio);
    }

    @Transactional
    public EstudioArqDTO modificarEstudio(HttpServletRequest request, Long id, EstudioArqDTO dto) {
        EstudioArq estudio = estudioArqRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado con ID: " + id));

        if(!puedeGestionarEstudio(request,id)){
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED, "El Arquitecto no puede modificar un estudio del que no forma parte.");
        }

        // Actualizar campos propios
        estudio.setNombre(dto.getNombre());

        // Actualizar imagen si corresponde
        if (dto.getImagenUrl() != null && !dto.getImagenUrl().isBlank()) {
            Imagen nuevaImagen = Imagen.builder().url(dto.getImagenUrl()).build();
            estudio.setImagen(nuevaImagen);
        }

        EstudioArq actualizado = estudioArqRepository.save(estudio);
        return estudioArqMapper.mapDTO(actualizado);
    }

    @Transactional
    public EstudioArqDTO actualizarEstudioImagenPerfil(HttpServletRequest request,Long id, String url) {

        EstudioArq estudio = estudioArqRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estudio no encontrado con ID: " + id));

        if (!puedeGestionarEstudio(request, id)) {
            throw new ProcesoInvalidoException(HttpStatus.UNAUTHORIZED,
                    "El Arquitecto logueado no pertenece al Estudio de Arquitectura ID: " + id);
        }

        estudio.setImagen(imagenService.obtenerImagen(url));

        return estudioArqMapper.mapDTO(estudioArqRepository.save(estudio));
    }

    private boolean puedeGestionarEstudio(HttpServletRequest request, Long id){
        Usuario usr = usuarioService.buscarUsuario(request);

        return usr.getCredencial().tieneRolUsuario(RolUsuario.ROLE_ADMINISTRADOR)
                || usr.getEstudios().stream().anyMatch(e -> e.getId().equals(id));
    }


}
