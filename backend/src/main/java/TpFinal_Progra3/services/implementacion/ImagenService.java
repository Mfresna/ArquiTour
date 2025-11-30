package TpFinal_Progra3.services.implementacion;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.entities.Imagen;
import TpFinal_Progra3.model.mappers.ImagenMapper;
import TpFinal_Progra3.repositories.ImagenRepository;
import TpFinal_Progra3.services.almacenamiento.PdfAImagenService;
import TpFinal_Progra3.services.interfaces.ImagenServiceInterface;
import TpFinal_Progra3.services.interfaces.ImagenStorageInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImagenService implements ImagenServiceInterface {

    private final ImagenRepository imagenRepository;
    private final ImagenMapper imagenMapper;
    private final ImagenStorageInterface almacImagenService;
    private final PdfAImagenService pdfAImagenService;


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

    public List<Imagen> obtenerImagenes(List<String> urls) {

        return urls.stream()
                .map(url -> imagenRepository.findByUrl(url)
                        .orElseThrow(() -> new NotFoundException("Imagen no encontrada: " + url))
                )
                .toList();
    }

    public void eliminarImagen(Long id) {
        if (!imagenRepository.existsById(id)) {
            throw new NotFoundException("Imagen no encontrada.");
        }
        imagenRepository.deleteById(id);
    }

    public void eliminarImagen(String url){
        imagenRepository.findByUrl(url).ifPresent(imagenRepository::delete);
    }

    public List<String> subirImagenes(List<MultipartFile> archivos){
        //Sube las imagenes y las guarda en la base de datos
        List<String> urls = almacImagenService.subirImagenes(archivos);

        urls.forEach(url->crearImagen(ImagenDTO.builder()
                        .url(url)
                        .build()));

        return urls;
    }

    public List<Imagen> subirArchivosMixtos(List<MultipartFile> archivos) {

        if (archivos == null || archivos.isEmpty()) {
            throw new IllegalArgumentException("La lista de archivos no puede ser nula ni estar vacía.");
        }

        List<Imagen> resultado = new ArrayList<>();

        // Separamos imágenes y PDFs
        List<MultipartFile> imagenes = new ArrayList<>();
        List<MultipartFile> pdfs = new ArrayList<>();

        for (MultipartFile archivo : archivos) {

            if (archivo == null || archivo.isEmpty()) {
                throw new IllegalArgumentException("Uno de los archivos enviados es nulo o está vacío.");
            }

            String contentType = archivo.getContentType();
            String nombreOriginal = archivo.getOriginalFilename();
            String nombreLower = (nombreOriginal == null) ? "" : nombreOriginal.toLowerCase();

            boolean esPdf = "application/pdf".equalsIgnoreCase(contentType)
                    || nombreLower.endsWith(".pdf");

            if (esPdf) {
                pdfs.add(archivo);
            } else {
                imagenes.add(archivo);
            }
        }

        // ===== 1) Procesar TODAS LAS IMÁGENES  =====
        if (!imagenes.isEmpty()) {
            List<String> urlsImagenes = almacImagenService.subirImagenes(imagenes);

            for (String url : urlsImagenes) {
                Imagen imagen = crearImagen(
                        ImagenDTO.builder()
                                .url(url)
                                .build()
                );
                resultado.add(imagen);
            }
        }

        // ===== 2) Procesar CADA PDF =====
        for (MultipartFile pdf : pdfs) {

            List<String> urlsPdf = pdfAImagenService.convertirPdfYGuardar(pdf);

            for (String url : urlsPdf) {
                Imagen imagen = crearImagen(
                        ImagenDTO.builder()
                                .url(url)
                                .build()
                );
                resultado.add(imagen);
            }
        }

        return resultado;
    }



}
