package TpFinal_Progra3.services;

import TpFinal_Progra3.exceptions.IPLocationException;
import TpFinal_Progra3.model.DTO.IPLocationDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.Optional;

@Service
public class IPLocationService {

    private final WebClient webClient = WebClient.create("https://ipwho.is");

    // Extrae la IP del cliente desde la solicitud HTTP
    public String obtenerIpCliente(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();   //Devuelve la ip del punto de salida (no siempre es la del cliente)
        } else {
            ip = ip.split(",")[0];  //ip -> 192.168.20.5 , 10.0.0.1 (Toma al primer IP que es del cliente)
        }
        return ip;
    }

    //Devuelve un DTO con la ubicacion del cliente
    public Optional<IPLocationDTO> obtenerUbicacion(String ip){

        return Optional.ofNullable(
                webClient.get()
                        .uri("/" + ip) // ← ipwho.is no requiere apiKey
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(json -> mapearAUbicacion(ip, json))
                        .block()
        );
    }

    private IPLocationDTO mapearAUbicacion(String ip, @NotNull Map<String, Object> json) throws IPLocationException{
        if(Boolean.FALSE.equals(json.get("success"))){
            //Hubo error
            if(json.containsKey("error")){
                throw new IPLocationException(json.get("error").toString());
            }else{
                throw new IPLocationException("Ocurrio un error en la recepcion del JSON-IPLocation.");
            }
        }

        //Si no tiene error devuelve el DTO Cargado
        return IPLocationDTO.builder()
                .ip(ip)
                .latitud(extraerDouble(json.get("latitude")))
                .longitud(extraerDouble(json.get("longitude")))
                .build();
    }

    private Double extraerDouble(Object valor) {
        return valor instanceof Number ? ((Number) valor).doubleValue() : null;
    }

}
