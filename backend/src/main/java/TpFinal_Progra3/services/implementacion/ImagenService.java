package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.mappers.ImagenMapper;
import TpFinal_Progra3.repositories.ImagenRepository;
import TpFinal_Progra3.services.almacenamiento.CloudinaryService;
import TpFinal_Progra3.services.interfaces.ImagenServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImagenService implements ImagenServiceInterface {

    private final ImagenRepository imagenRepository;
    private final ImagenMapper imagenMapper;
    private final CloudinaryService cloudinaryService;

    public Imagen crearImagen(ImagenDTO dto) {
        return imagenRepository.save(imagenMapper.mapImagen(dto));
    }

    public ImagenDTO obtenerImagen(Long id) {
        return imagenRepository.findById(id)
                .map(imagenMapper::mapDTO)
                .orElseThrow(() -> new NotFoundException("Imagen no encontrada con ID: " + id));
    }

    public Imagen obtenerImagen(String url) {
        //Si no la encuentra la crea y la guarda en la bdd
        return imagenRepository.findByUrl(url)
                .orElseThrow(() -> new NotFoundException("Imagen no encontrada con URL: " + url));
    }

    public void eliminarImagen(Long id) {
        if (!imagenRepository.existsById(id)) {
            throw new NotFoundException("Imagen no encontrada.");
        }
        imagenRepository.deleteById(id);
    }

    public List<String> subirImagenes(List<MultipartFile> archivos){
        //Sube las imagenes y las guarda en la base de datos
        List<String> urls = cloudinaryService.subirImagenes(archivos);

        urls.forEach(url->crearImagen(ImagenDTO.builder()
                        .url(url)
                        .build()));

        return urls;
    }

}
