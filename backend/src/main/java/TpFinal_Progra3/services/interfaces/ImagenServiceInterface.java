package TpFinal_Progra3.services.interfaces;

import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.entities.Imagen;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImagenServiceInterface {
    Imagen crearImagen(ImagenDTO dto);
    ImagenDTO obtenerImagen(Long id);
    Imagen obtenerImagen(String url);
    void eliminarImagen(Long id);
    List<String> subirImagenes(List<MultipartFile> archivos);
}
