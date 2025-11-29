package TpFinal_Progra3.services.almacenamiento;

import TpFinal_Progra3.services.implementacion.ImagenService;
import TpFinal_Progra3.model.DTO.ImagenDTO;
import TpFinal_Progra3.model.entities.Imagen;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfAImagenService {

    private final LocalStorageService localStorageService;

    /**
     * Convierte un PDF a imágenes JPG, las guarda en disco usando LocalStorageService
     * y devuelve la lista de URLs generadas.
     */
    public List<String> convertirPdfYGuardar(MultipartFile pdf) {

        List<byte[]> paginas = convertirPdfAImagenesJpg(pdf);
        List<String> urls = new ArrayList<>();

        for (int i = 0; i < paginas.size(); i++) {
            byte[] datos = paginas.get(i);

            // nombre "falso" sólo para poder sacar extensión .jpg
            String nombreArtificial = "pagina-" + (i + 1) + ".jpg";

            // Guarda físicamente la imagen y devuelve la ruta (ej: /imagen/uuid.jpg)
            String ruta = localStorageService.subirImagenDesdeBytes(datos, nombreArtificial);

            urls.add(ruta);
        }

        return urls;
    }

    /**
     * Convierte un PDF en una lista de byte[] (cada posición es una página como JPG).
     */
    private List<byte[]> convertirPdfAImagenesJpg(MultipartFile pdf) {
        List<byte[]> imagenes = new ArrayList<>();

        try (PDDocument document = Loader.loadPDF(pdf.getBytes())) {

            PDFRenderer pdfRenderer = new PDFRenderer(document);
            int totalPaginas = document.getNumberOfPages();

            for (int i = 0; i < totalPaginas; i++) {
                BufferedImage imagen = pdfRenderer.renderImageWithDPI(
                        i,
                        200,
                        ImageType.RGB
                );

                try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                    ImageIO.write(imagen, "jpg", baos);
                    baos.flush();
                    imagenes.add(baos.toByteArray());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al convertir el PDF a imágenes", e);
        }

        return imagenes;
    }
}