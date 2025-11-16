package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.CredencialException;
import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.DTO.filtros.UsuarioFiltroDTO;
import TpFinal_Progra3.model.DTO.obras.ObraDTO;
import TpFinal_Progra3.model.DTO.obras.ObraResponseDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioBasicoDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioDTO;
import TpFinal_Progra3.model.DTO.usuarios.UsuarioResponseDTO;
import TpFinal_Progra3.model.entities.*;
import TpFinal_Progra3.model.mappers.ObraMapper;
import TpFinal_Progra3.model.mappers.UsuarioMapper;
import TpFinal_Progra3.repositories.ObraRepository;
import TpFinal_Progra3.repositories.UsuarioRepository;
import TpFinal_Progra3.security.model.DTO.PasswordDTO;
import TpFinal_Progra3.security.model.DTO.RolesDTO;
import TpFinal_Progra3.security.model.entities.Credencial;
import TpFinal_Progra3.security.model.entities.Rol;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import TpFinal_Progra3.security.repositories.RolRepository;
import TpFinal_Progra3.security.services.JwtService;
import TpFinal_Progra3.security.services.ValidacionEmailService;
import TpFinal_Progra3.services.interfaces.UsuarioServiceInterface;
import TpFinal_Progra3.specifications.UsuarioSpecification;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UsuarioServiceInterface {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final RolRepository rolRepository;
    private final ImagenService imagenService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ValidacionEmailService validacionEmailService;

    @Value("${default.admin.email}")
    private String defaultAdminEmail;

//    @Transactional
//    public UsuarioResponseDTO registrarUsuario(UsuarioDTO dto) {
//        try {
//            //Validar la existencia de un email
//            if (usuarioRepository.existsByEmailIgnoreCase(dto.getEmail())) {
//                throw new ProcesoInvalidoException(HttpStatus.UNPROCESSABLE_ENTITY, "El email ya existe en la base de datos.");
//            }
//            if (!validacionEmailService.isEmailValidado(dto.getEmail())) {
//                throw new ProcesoInvalidoException(HttpStatus.FORBIDDEN, "El email no ha sido verificado.");
//            }
//
//            Usuario usuarioNuevo = usuarioMapper.mapUsuario(dto);
//
//            //Agrega la Credencial nueva con el Rol Usuario
//            usuarioNuevo.setCredencial(Credencial.builder()
//                    .email(dto.getEmail())
//                    .usuario(usuarioNuevo)
//                    .password(passwordEncoder.encode(dto.getPassword()))
//                    .roles(Set.of(rolRepository.findByRol(RolUsuario.ROLE_USUARIO)
//                            .orElseThrow(() -> new NotFoundException(HttpStatus.INTERNAL_SERVER_ERROR,
//                                    "El rol asignado automaticamente no existe en la Base de Datos"))))
//                    .build());
//
//            //Agrega la imagen si existe en el DTO
//            if (dto.getImagenUrl() != null) {
//                usuarioNuevo.setImagen(imagenService.obtenerImagen(dto.getImagenUrl()));
//            }
//
//            UsuarioResponseDTO usrNuevo = usuarioMapper.mapResponseDTO(usuarioRepository.save(usuarioNuevo));
//
//            validacionEmailService.eliminar(dto.getEmail());
//
//            return usrNuevo;
//        } catch (Exception e) {
//            //En caso de error borra la imagen si ya fue dada de alta en la BD
//            if (!dto.getImagenUrl().isEmpty()) {
//                imagenService.eliminarImagen(dto.getImagenUrl());
//            }
//            throw e;
//        }
//    }

    @Transactional
    public UsuarioResponseDTO registrarUsuario(UsuarioDTO dto,MultipartFile imagenPerfil) {
        //Validar la existencia de un email
        if (usuarioRepository.existsByEmailIgnoreCase(dto.getEmail())) {
            throw new ProcesoInvalidoException(HttpStatus.UNPROCESSABLE_ENTITY, "El email ya existe en la base de datos.");
        }
        if (!validacionEmailService.isEmailValidado(dto.getEmail())) {
            throw new ProcesoInvalidoException(HttpStatus.FORBIDDEN, "El email no ha sido verificado.");
        }

        Usuario usuarioNuevo = usuarioMapper.mapUsuario(dto);

        //Agrega la Credencial nueva con el Rol Usuario
        usuarioNuevo.setCredencial(Credencial.builder()
                .email(dto.getEmail())
                .usuario(usuarioNuevo)
                .password(passwordEncoder.encode(dto.getPassword()))
                .roles(Set.of(rolRepository.findByRol(RolUsuario.ROLE_USUARIO)
                        .orElseThrow(() -> new NotFoundException(HttpStatus.INTERNAL_SERVER_ERROR,
                                "El rol asignado automaticamente no existe en la Base de Datos"))))
                .build());


        //Carga la img
        String urlImg = "";
        if (imagenPerfil != null && !imagenPerfil.isEmpty()) {
            urlImg = imagenService.subirImagenes(List.of(imagenPerfil)).getFirst();
            usuarioNuevo.setImagen(imagenService.obtenerImagen(urlImg));
        }

        try {
            UsuarioResponseDTO usrNuevo = usuarioMapper.mapResponseDTO(usuarioRepository.save(usuarioNuevo));

            validacionEmailService.eliminar(dto.getEmail());

            return usrNuevo;
        }catch (Exception e){
            //La borro de la base de datos
            if(imagenPerfil != null && !imagenPerfil.isEmpty()){
                imagenService.eliminarImagen(urlImg);
            }

            throw e;
        }
    }



    public Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con ID: " + id));
    }

    public Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado con el Email: " + email));
    }

    public Usuario buscarUsuario(HttpServletRequest request) {
        String tokenHeader = request.getHeader("Authorization");
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            throw new CredencialException(HttpStatus.UNAUTHORIZED,"No se identificó el Token proporcionado.");
        }
        String emailUsuario = jwtService.extractUsername(tokenHeader.substring(7));

        return usuarioRepository.findByEmailIgnoreCase(emailUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado a partir del Token recibido."));
    }

    public UsuarioResponseDTO obtenerUsuario(Long id) {
        return usuarioMapper.mapResponseDTO(buscarUsuario(id));
    }

    public List<UsuarioResponseDTO> filtrarUsuarios(UsuarioFiltroDTO filtro) {
        // Validar existencia del rol si se solicita
        if (filtro.getRol() != null && rolRepository.findByRol(filtro.getRol()).isEmpty()) {
            throw new NotFoundException("El rol " + filtro.getRol() + " no existe.");
        }

        return usuarioRepository.findAll(UsuarioSpecification.filtrar(filtro))
                .stream()
                .map(usuarioMapper::mapResponseDTO)
                .toList();
    }

    public UsuarioResponseDTO modificarUsuario(HttpServletRequest request, Long id, UsuarioBasicoDTO usrDto) {

        if(!obtenerMiPerfil(request).getId().equals(id)){
            throw new ProcesoInvalidoException("El usuario no puede modificar un perfil que no sea el suyo.");
        }

        //Si el usuario no existe lanza excepcion el metodo buscarUsuario
        Usuario usuario = buscarUsuario(id);
        usuario.setNombre(usrDto.getNombre());
        usuario.setApellido(usrDto.getApellido());
        usuario.setFechaNacimiento(usrDto.getFechaNacimiento());
        usuario.setDescripcion(usrDto.getDescripcion());
        //NO ACTUALIZO LA IMG ESO SE ENCARGAN OTROS METODOS

        return usuarioMapper.mapResponseDTO(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO actualizarImagenPerfil(HttpServletRequest request, String url) {
        //Usuario Logeado
        Usuario usuario = buscarUsuario(obtenerMiPerfil(request).getId());
        usuario.setImagen(imagenService.obtenerImagen(url));

        return usuarioMapper.mapResponseDTO(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO borrarImagenPerfil(HttpServletRequest request) {
        //Usuario Logeado
        Usuario usuario = buscarUsuario(obtenerMiPerfil(request).getId());
        String urlBorrar = usuario.getImagen().getUrl();

        usuario.setImagen(null);

        UsuarioResponseDTO usuarioActualizado =  usuarioMapper.mapResponseDTO(usuarioRepository.save(usuario));
        
        //Elimina la imagen de la BD luego de guardar el usuario por las constrains de la BD
        imagenService.eliminarImagen(urlBorrar);

        return usuarioActualizado;
    }

    public UsuarioResponseDTO inhabilitarCuenta(Long id,HttpServletRequest request) {
        if(obtenerMiPerfil(request).getId().equals(id)){
            throw new ProcesoInvalidoException("El usuario " + id + " no puede inhabilitar su propia cuenta.");
        }


        Usuario usr = buscarUsuario(id);
        if(!usr.getIsActivo()){
            throw new ProcesoInvalidoException("El usuario " + id + " ya se encontraba inhabilitado.");
        } else if (usr.getEmail().equals(defaultAdminEmail)) {
            throw new ProcesoInvalidoException("El usuario " + id + " no se puede inhabilitar.");
        }
        usr.setIsActivo(false);
        usuarioRepository.save(usr);

        return (usuarioMapper.mapResponseDTO(usr));
    }

    public UsuarioResponseDTO habilitarCuenta(Long id,HttpServletRequest request) {
        if(obtenerMiPerfil(request).getId().equals(id)){
            throw new ProcesoInvalidoException("El usuario " + id + " no puede habilitar su propia cuenta.");
        }

        Usuario usr = buscarUsuario(id);
        if(usr.getIsActivo()){
            throw new ProcesoInvalidoException("El usuario " + id + " ya se encontraba habilitado");
        }
        usr.setIsActivo(true);
        usuarioRepository.save(usr);

        return (usuarioMapper.mapResponseDTO(usr));
    }

    public UsuarioResponseDTO obtenerMiPerfil(HttpServletRequest request){
        return usuarioMapper.mapResponseDTO(buscarUsuario(request));
    }

    public UsuarioResponseDTO agregarRoles(HttpServletRequest request, Long id, RolesDTO rolesDTO){
        if(obtenerMiPerfil(request).getId().equals(id)){
            throw new ProcesoInvalidoException("El usuario " + id + " no puede agregar roles a su propia cuenta.");
        }

        Usuario usr = buscarUsuario(id);
        if(!usr.getIsActivo()){
            throw new ProcesoInvalidoException("No se permite modificar los roles de un usuario inhabilitado");
        }

        rolesDTO.getRoles().forEach(rol ->
           usr.getCredencial()
                   .getRoles()
                   .add(rolRepository.findByRol(rol)
                           .orElseThrow(() -> new NotFoundException("El rol no se encuentra en la Base de Datos"))
                   ));

        return usuarioMapper.mapResponseDTO(usuarioRepository.save(usr));
    }

    public UsuarioResponseDTO quitarRoles(HttpServletRequest request, Long id, RolesDTO rolesDTO){
        if(obtenerMiPerfil(request).getId().equals(id)){
            throw new ProcesoInvalidoException("El usuario " + id + " no puede quitarse roles a su propia cuenta.");
        }

        Usuario usr = buscarUsuario(id);
        if(!usr.getIsActivo()){
            throw new ProcesoInvalidoException("No se permite modificar los roles de un usuario inhabilitado");
        }

        if(usr.getEmail().equals(defaultAdminEmail)){
            throw new ProcesoInvalidoException("Al usuario " + id + " no se le puede quitar roles.");
        }

        if(rolesDTO.getRoles().contains(RolUsuario.ROLE_USUARIO)){
            throw new ProcesoInvalidoException(HttpStatus.BAD_REQUEST,"El Rol Usuario no puede ser revocado");
        }

        rolesDTO.getRoles().forEach(rol ->
                usr.getCredencial()
                        .getRoles()
                        .remove(rolRepository.findByRol(rol)
                                .orElseThrow(() -> new NotFoundException("El rol no se encuentra en la Base de Datos"))
                        ));

        return usuarioMapper.mapResponseDTO(usuarioRepository.save(usr));
    }

    public String cambiarPassword(Usuario usr, PasswordDTO passwordDTO){
        usr.getCredencial().setPassword(passwordEncoder.encode(passwordDTO.getNuevaPassword()));
        usuarioRepository.save(usr);

        return ("La contraseña ha sido modificada con exito.");
    }

    //---------------METODOS SUPERFLUOS A CONTROLLER----------------

    @Transactional
    public void eliminarFavoritoDeUsuario(Usuario usuario, Favorito favorito) {
        usuario.getListaFavoritos().remove(favorito);
        usuarioRepository.save(usuario);
    }

    public void guardarUsuario(Usuario usuario){
        usuarioRepository.save(usuario);
    }

    public boolean existeUsuario(String email){
        return usuarioRepository.existsByEmailIgnoreCase(email);
    }

}

