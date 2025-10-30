package TpFinal_Progra3.services.interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImagenStorageInterface {
    String subirImagen(MultipartFile archivo);
    List<String> subirImagenes(List<MultipartFile> archivos);
    boolean delete(String filename);
}
