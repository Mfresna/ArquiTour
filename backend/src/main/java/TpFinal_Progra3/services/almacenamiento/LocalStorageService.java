package TpFinal_Progra3.services.almacenamiento;

import TpFinal_Progra3.services.interfaces.StorageInterface;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class LocalStorageService implements StorageInterface {

    private final Path rutaLocal;

    private LocalStorageService(@Value("${dir.imagenes}") String dirImagenes) throws IOException {
        //La ruta relativa ./imagenes => la convierte en absoluta (C://usr/fotos/imagenes/)
        this.rutaLocal = Paths.get(dirImagenes).toAbsolutePath().normalize();

        //Si no existe crea el directorio, si no tiene permisos lanza IOException
        Files.createDirectories(this.rutaLocal);
    }

    //
    public String subirImagen(MultipartFile archivo){

    }
    public List<String> subirImagenes(List<MultipartFile> archivos){

    }

    public boolean delete(String filename){

    }



}
