package TpFinal_Progra3.services;

import TpFinal_Progra3.exceptions.CargarImagenException;
import com.cloudinary.Cloudinary;
import com.cloudinary.api.exceptions.ApiException;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", System.getProperty("cloud.name"),
            "api_key", System.getProperty("cloud.key"),
            "api_secret", System.getProperty("cloud.secret")
    ));

    public String subirImagen(MultipartFile archivo){
        try {
            Map<?, ?> resultado = cloudinary
                    .uploader()
                    .upload(archivo.getBytes(), ObjectUtils.emptyMap());

            return resultado.get("secure_url").toString();
        } catch (IOException e) {
            throw new CargarImagenException("Error de lectura del archivo de imagen.");
        } catch (Exception e) {
            throw new CargarImagenException("Error inesperado al subir la imagen");
        }
    }

    public List<String> subirImagenes(List<MultipartFile> archivos) {
        return archivos.stream().map(archivo -> {
            try {
                Map<?, ?> resultado = cloudinary.uploader()
                        .upload(archivo.getBytes(), ObjectUtils.emptyMap());
                return resultado.get("secure_url").toString();
            } catch (IOException e) {
                throw new CargarImagenException("Error de lectura del archivo: " + archivo.getOriginalFilename());
            } catch (Exception e) {
                throw new CargarImagenException("Error inesperado al subir la imagen: " + archivo.getOriginalFilename());
            }
        }).collect(Collectors.toList());
    }


}
