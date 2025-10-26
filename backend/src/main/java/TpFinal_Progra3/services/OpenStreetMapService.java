package TpFinal_Progra3.services;

import TpFinal_Progra3.utils.CoordenadasUtils;
import TpFinal_Progra3.exceptions.CoordenadaException;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class OpenStreetMapService {

    public String generarMapaConMarcador(double lat, double lon, @Min(0) @Max(19)int zoom) {
        //El zoom está limitado a 1 a 19 por api de OSM
        //debo usar locale US asi la coma del double se transforma en un punto para la URL
        if(CoordenadasUtils.validarCoordenadas(lat,lon) != 0){
            switch (CoordenadasUtils.validarCoordenadas(lat,lon)) {
                case -1 -> throw new CoordenadaException(HttpStatus.CONFLICT, "Latitud Invalida (fuera de rango).");
                case -2 -> throw new CoordenadaException(HttpStatus.CONFLICT,"Longitud Invalida (fuera de rango).");
                case -3 -> throw new CoordenadaException(HttpStatus.CONFLICT,"Ambas Coordenadas invalidas.");
            }
        }

        return String.format(Locale.US,
                "https://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f#map=%d/%.6f/%.6f",
                lat, lon, zoom, lat, lon
        );
    }

    public Map<String,Double> areaDeCiudadPais(String ciudad, String pais) {

        WebClient webClient = WebClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader(HttpHeaders.USER_AGENT, "ArquiTour")
                .build();

        String query;
        if (ciudad != null && !ciudad.isBlank()) {
            query = (pais != null && !pais.isBlank()) ? ciudad + "," + pais : ciudad;
        } else {
            query = pais;
        }

        return webClient.get().uri(uriBuilder -> uriBuilder
                                .path("/search")
                                .queryParam("q", query)
                                .queryParam("format", "json")
                                .queryParam("limit", 1)
                                .build())
                        .retrieve()
                        .bodyToMono(List.class)
                        .map(CoordenadasUtils::areaDeBusqueda)
                        .block();
    }
}
