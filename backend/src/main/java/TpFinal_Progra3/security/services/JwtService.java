package TpFinal_Progra3.security.services;

import TpFinal_Progra3.exceptions.ProcesoInvalidoException;
import TpFinal_Progra3.model.entities.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/// MANEJADOR DE TOKENS
@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecretKey;

    @Value("${jwt.expiration}")
    private Long jwtVencimientoAccess;

    @Value("${jwt.expiration.refresh}")
    private Long jwtVencimientoRefresh;

    @Value("${jwt.expiration.email}")
    private Long jwtVencimientoTokenEmail;

    //Extrae el claim del username o el ID segun como generé el Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    //Genera el token con los roles, hace uso de BuildToken.
    public String generarToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        claims.put("typ", "ACCESS");    //Indica si es de Acceso o de Refresh o ChangePass
        return buildToken(claims, userDetails, jwtVencimientoAccess);
    }

    //Genera un Token solo con el ID del usuario para que cambie la contraseña por mail
    public String generarToken(Usuario usuario) {
        if(!usuario.getIsActivo()){
            throw new ProcesoInvalidoException(HttpStatus.FORBIDDEN,"El usuario está inhabilitado.");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("isActive", usuario.getIsActivo());  //Si llega acá siempre
        claims.put("typ", "CHANGEPASS");    //Indica si es de Acceso o de Refresh o ChangePass
        return buildToken(claims, usuario.getEmail() , jwtVencimientoTokenEmail);
    }

    //Valida que un token sea valido, comparando que el username sea el mismo y que no este expirado.
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()))
                && !isTokenExpired(token)
                && userDetails.isAccountNonLocked()
                && userDetails.isEnabled()
                && getTipo(token).equals("ACCESS");
    }

    //Valida que el Token Restaurar Contraseña sea Valido
    public boolean isTokenValid(String token) {
        String email = extractUsername(token);
        Boolean isActive = extractAllClaims(token).get("isActive", Boolean.class);

        //True => isActivo y no está vencido
        return email != null &&
               isActive != null && isActive &&
               !isTokenExpired(token) &&
                getTipo(token).equals("CHANGEPASS");
    }

    //---------------REFRESH TOKEN----------------

    //Generar un Refresh Token
    public String generarRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "REFRESH");    //Indica si es de Acceso o de Refresh o ChangePass
        return buildToken(claims, userDetails, jwtVencimientoRefresh);
    }

    //Valida que sea de tipo refresh y no este vencido
    public boolean isRefreshValido(String token) {
        return getTipo(token).equals("REFRESH") && !isTokenExpired(token);
    }

    public String getTipo(String token) {
        return extractAllClaims(token).get("typ", String.class);
    }

    //---------------METODOS DURACIONES DE TOKEN----------------//

    public long getJwtVencimientoAccess(){
        return jwtVencimientoAccess;
    }

    public long jwtVencimientoRefresh(){
        return jwtVencimientoRefresh;
    }

    public long jwtVencimientoTokenEmail(){
        return jwtVencimientoTokenEmail;
    }

    //---------------METODOS PRIVADOS----------------//

    //Extrae una claim especifica
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    //Extrae todos los claims
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    //Construye un token
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration){
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    //Construye un token para recuperar Pass (sirve para recuperar Pass)
    private String buildToken(Map<String, Object> extraClaims, String emailUsuario, long vencimiento) {
        return Jwts.builder()
                .setClaims(extraClaims) //Contiene el EMAIL y el isActivo
                .setSubject(emailUsuario)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + vencimiento))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    //Obtiene la KEY para firmar el token.
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    //Valida que el token no este expirado.
    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }

}
