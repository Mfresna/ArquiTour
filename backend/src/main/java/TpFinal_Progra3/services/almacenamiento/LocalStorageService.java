package TpFinal_Progra3.services.almacenamiento;

import TpFinal_Progra3.exceptions.CargarImagenException;
import TpFinal_Progra3.services.interfaces.ImagenStorageInterface;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Profile("local")
public class LocalStorageService implements ImagenStorageInterface {

    private final Path rutaLocal;
    private static final Set<String> EXTENSIONES_VALIDAS = Set.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp");

    private LocalStorageService(@Value("${dir.imagenes}") String dirImagenes) throws IOException {
        //La ruta relativa ./imagenes => la convierte en absoluta (C://usr/fotos/imagenes/)
        this.rutaLocal = Paths.get(dirImagenes).toAbsolutePath().normalize();

        //Si no existe crea el directorio, si no tiene permisos lanza IOException
        Files.createDirectories(this.rutaLocal);
    }

    public String subirImagen(MultipartFile archivo){

        if (archivo.isEmpty()) {
            throw new CargarImagenException(HttpStatus.BAD_REQUEST,"El archivo está vacio.");
        }

        //VALIDACIONES DE SEGURIDAD
            //Valida que la imagen sea imagen
        try {
            if (ImageIO.read(archivo.getInputStream()) == null) {
                throw new CargarImagenException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"El archivo no es una imagen válida.");
            }
        } catch (IOException e) {
            throw new CargarImagenException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"No se pudo leer la imagen.");
        }

            // Valida la extension del archivo
        String extensionValida = getExtension(StringUtils.cleanPath(archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename()));

        //NOMBRE UNICO DE LA IMAGEN
        String nombreArchivo = UUID.randomUUID() + (extensionValida.isBlank() ? ".img" : extensionValida);

        //Ruta de la imagen a guardar
        Path target = this.rutaLocal.resolve(nombreArchivo).normalize();

        if (!target.getParent().equals(this.rutaLocal)) {
            throw new CargarImagenException("Ruta inválida.");
        }

        //GUARDA EL ARCHIVO EN LA RUTA TARGET
            //Si existe un archivo con el mismo nombre lo reeemplaza (poco probable por UUID)
        try {
            Files.copy(archivo.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new CargarImagenException(HttpStatus.INTERNAL_SERVER_ERROR ,"Error al guardar la imagen.");
        }

        return "/imagen/" + nombreArchivo;
    }

    public List<String> subirImagenes(List<MultipartFile> archivos){
        //llama al metodo subirImagen y arma la coleccion para devolverla
        return archivos.stream().map(this::subirImagen).collect(Collectors.toList());
    }

    public boolean delete(String rutaArchivo){
        //rutaArchivo es la ruta relativa guardada en la BD => uploads\img\foto.jpg
        Path target = this.rutaLocal.resolve(rutaArchivo).normalize();

        if (!target.getParent().equals(this.rutaLocal)) {
            //Si la ruta es igual que la ruta de origen
            return false;
        }

        try{
            return Files.deleteIfExists(target);
        } catch (IOException e) {
            return false;
        }
    }

    private String getExtension (String nombreArchivo){

        String extension;
        int i = nombreArchivo.lastIndexOf('.');

        if (i >= 0 && i < nombreArchivo.length() - 1) {

            extension = nombreArchivo.substring(i).toLowerCase();

            if (!EXTENSIONES_VALIDAS.contains(extension)) {
                throw new CargarImagenException(HttpStatus.BAD_REQUEST, "La extensión '" + extension + "' no está permitida. Solo se aceptan: " + EXTENSIONES_VALIDAS);
            }

        } else {
            throw new CargarImagenException(HttpStatus.BAD_REQUEST, "El nombre de archivo no contiene una extensión válida.");
        }

        return extension;
    }

}
