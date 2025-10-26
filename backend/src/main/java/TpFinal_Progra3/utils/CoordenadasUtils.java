package TpFinal_Progra3.utils;

import TpFinal_Progra3.exceptions.CoordenadaException;
import TpFinal_Progra3.model.DTO.IPLocationDTO;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CoordenadasUtils {

    public static double dmsToDouble(String cordenadaDms) throws CoordenadaException {

        //Verifico que la Cordenada no sea Null o Vacia
        if (cordenadaDms == null || cordenadaDms.trim().isEmpty()) {
            throw new CoordenadaException("La coordenada no puede ser nula o vacía.");
        }

        // Valida que el final de la coordenada sea valido
        char cardinal = contieneCardinal(cordenadaDms.trim().toUpperCase());

        // Quitar la letra y dividir en partes
        String coordenada = cordenadaDms.substring(0, cordenadaDms.length() - 1).trim();
        String[] partes = coordenada.split("[°'\"]");

        if (partes.length != 3) {
            throw new CoordenadaException("Formato incorrecto. Se esperaban grados, minutos y segundos.");
        }

        try {
            int grados = Integer.parseInt(partes[0].trim());
            int minutos = Integer.parseInt(partes[1].trim());
            double segundos = Double.parseDouble(partes[2].trim());

            // Validar rangos
            if (grados < 0 || minutos < 0 || minutos >= 60 || segundos < 0 || segundos >= 60) {
                throw new CoordenadaException("Valores fuera de rango: grados >= 0, minutos y segundos entre 0 y 59.");
            }

            // Valida si la Latitud o la Longitud son Validas
            if ((cardinal == 'N' || cardinal == 'S') && grados > 90) {
                throw new CoordenadaException("Latitud inválida: grados deben ser entre 0 y 90.");
            }
            if ((cardinal == 'E' || cardinal == 'W') && grados > 180) {
                throw new CoordenadaException("Longitud inválida: grados deben ser entre 0 y 180.");
            }

            // CONVERSION A DOUBLE
            double coordenadaDouble = grados + (minutos / 60.0) + (segundos / 3600.0);
            if (cardinal == 'S' || cardinal == 'W') {
                coordenadaDouble *= -1;
            }

            //La coordenada convertida
            return coordenadaDouble;

        } catch (NumberFormatException e) {
            throw new CoordenadaException("No se pudo convertir grados, minutos o segundos a número.");
        }
    }

    public static String doubleToDMS(double cordenadaDouble, boolean isLat) throws CoordenadaException {
        // Validar cardinal
        char cardinal;
        if(isLat && (cordenadaDouble>-90 || cordenadaDouble<90)){
            //Latitud entre -90 y 90
            if(cordenadaDouble<0){
                //SUR
                cardinal = 'S';
            }else{
                //NORTE
                cardinal = 'N';
            }
        }else if (!isLat && (cordenadaDouble>-180 || cordenadaDouble<180)){
            //Longitud entre -180 y 180
            if(cordenadaDouble<0){
                //ESTE
                cardinal = 'W';
            }else{
                //OESTE
                cardinal = 'W';
            }
        }else{
            throw new CoordenadaException("Cordenada invalida segun latitud y longitud");
        }


        cordenadaDouble = Math.abs(cordenadaDouble);

        int grados = (int) cordenadaDouble;
        double decimalMin = (cordenadaDouble - grados) * 60;
        int minutos = (int) decimalMin;
        double segundos = (decimalMin - minutos) * 60;

        // Formatear como "57°33'10.0\"W"
        return String.format("%d°%02d'%04.1f\"%s", grados, minutos, segundos, cardinal);
    }

    // 0 - OK || -1 - ERROR LATITUD || -2 - ERROR LONGITUD || -3 - ERROR AMBOS
    public static int validarCoordenadas(double lat, double lon){
        int retorno = 0; //Asumo que es correcta

        if(lat <= -90 || lat >= 90){
            //Latitud fuera de rango
            retorno -= 1;
        }
        if(lon <= -180 || lon >= 180){
            //Longitud fuera de rango
            retorno -= 2;
        }

        return retorno;
    }

    private static char contieneCardinal(String coordenadaDMS){
        if(coordenadaDMS.toUpperCase().contains("N") || coordenadaDMS.toUpperCase().contains("E")
        || coordenadaDMS.toUpperCase().contains("S") || coordenadaDMS.toUpperCase().contains("W")) {
            //Contiene cardinal valido y devuelve el mismo
            return coordenadaDMS.charAt(coordenadaDMS.length() - 1);
        }else {
            //No contiene Letra es un error
            throw new CoordenadaException("La Cordenada no contiene Cardinalidad (NSEW)");
        }

    }

    //Obtiene las coordenadas para buscar por distancia
    public static Map<String,Double> areaDeBusqueda(IPLocationDTO ubicacionUsuario, Double distanciaKm) {
        //Formula de Haversine
        switch (validarCoordenadas(ubicacionUsuario.getLatitud(),ubicacionUsuario.getLongitud())){
            case -1 -> throw new CoordenadaException("Error en la latitud del usuario");
            case -2 -> throw new CoordenadaException("Error en la longitud del usuario");
            case -3 -> throw new CoordenadaException("Error en las coordenadas del usuario");
        }
            //Si las coordenadas están bien continuo
        final Double EARTH_RADIUS_KM = 6371.0;  //Diametro de la Tierra en KM

        //La latitud del cliente se convierte a un double de radianes
        double latRad = Math.toRadians(ubicacionUsuario.getLatitud());

        double deltaLat = Math.toDegrees(distanciaKm / EARTH_RADIUS_KM);
        double deltaLon = Math.toDegrees(distanciaKm / EARTH_RADIUS_KM / Math.cos(latRad));

        Map<String, Double> areaBusqueda = new HashMap<>();
        areaBusqueda.put("latMin", (ubicacionUsuario.getLatitud() - deltaLat));
        areaBusqueda.put("latMax", (ubicacionUsuario.getLatitud() + deltaLat));
        areaBusqueda.put("lonMin", (ubicacionUsuario.getLongitud() - deltaLon));
        areaBusqueda.put("lonMax", (ubicacionUsuario.getLongitud() + deltaLon));

        return areaBusqueda;
    }

    //Obtiene las coordenadas por ciudad y pais
    public static Map<String,Double> areaDeBusqueda(List<?> resultadoJson) {
        if (resultadoJson == null || resultadoJson.isEmpty()){
            throw new CoordenadaException(HttpStatus.INTERNAL_SERVER_ERROR,"El JSON recibido de la Api posee inconsitenticias");
        }

        Map<?, ?> area = (Map<?, ?>) resultadoJson.get(0);
        List<String> coordenadas = (List<String>) area.get("boundingbox");

        if (coordenadas == null || coordenadas.size() != 4){
            throw new CoordenadaException(HttpStatus.INTERNAL_SERVER_ERROR,"El JSON recibido de la Api posee inconsitenticias");

        }

        try {
            Map<String, Double> areaBusqueda = new HashMap<>();
            areaBusqueda.put("latMin", Double.parseDouble(coordenadas.get(0)));
            areaBusqueda.put("latMax", Double.parseDouble(coordenadas.get(1)));
            areaBusqueda.put("lonMin", Double.parseDouble(coordenadas.get(2)));
            areaBusqueda.put("lonMax", Double.parseDouble(coordenadas.get(3)));
            return areaBusqueda;
        } catch (NumberFormatException e) {
            throw new CoordenadaException(HttpStatus.INTERNAL_SERVER_ERROR, "Las coordenadas no se pueden convertir.");
        }
    }


}
