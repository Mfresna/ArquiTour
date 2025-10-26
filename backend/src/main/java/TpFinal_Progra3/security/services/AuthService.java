package TpFinal_Progra3.security.services;

import TpFinal_Progra3.security.model.DTO.AuthRequest;
import TpFinal_Progra3.security.repositories.CredencialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final CredencialRepository credencialRepository;
    private final AuthenticationManager manejadorDeAutenticacion;

    public UserDetails authenticate(AuthRequest input) {
        manejadorDeAutenticacion.authenticate(
                new UsernamePasswordAuthenticationToken(input.username(), input.password())
        );
        return credencialRepository.findByEmail(input.username()).orElseThrow();
    }
}



