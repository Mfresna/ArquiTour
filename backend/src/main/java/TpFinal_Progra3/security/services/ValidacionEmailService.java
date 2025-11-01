package TpFinal_Progra3.security.services;

import TpFinal_Progra3.exceptions.NotFoundException;
import TpFinal_Progra3.exceptions.ValidacionPinException;
import TpFinal_Progra3.repositories.UsuarioRepository;
import TpFinal_Progra3.security.model.DTO.PinRequestDTO;
import TpFinal_Progra3.security.model.DTO.PinValidarDTO;
import TpFinal_Progra3.security.model.entities.ValidacionEmail;
import TpFinal_Progra3.security.repositories.ValidacionEmailRepository;
import TpFinal_Progra3.services.EmailService;
import TpFinal_Progra3.services.implementacion.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
public class ValidacionEmailService {

    private final ValidacionEmailRepository validacionEmailRepository;
    private SecureRandom random = new SecureRandom();
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final UsuarioRepository usuarioRepository;

    @Value("${pin.ttl}")
    private int TTL_PIN;

    @Value("${resend.cooldown}")
    private int COOLDOWN;

    @Value("${max.intentos}")
    private int INTENTOS;

    public void enviarPIN(PinRequestDTO dto) {

        String email = getEmailNormalizado(dto.email());

        if(usuarioRepository.existsByEmailIgnoreCase(email)){
            //El mail ya esta registrado
            throw new ValidacionPinException("El mail ya se encuentra registrado en la Base de Datos");
        }

        if(tieneValidacion(email)){
            //Tiene Validacion
            ValidacionEmail validacion = getValidacionExistente(email);

            if (validacion.isValidado()) {
                throw new ValidacionPinException(HttpStatus.ALREADY_REPORTED, "El correo ya fue verificado previamente. Continuá con el registro.");
            }

            if (!isExpirado(validacion) && tieneCooldown(validacion)) {
                throw new ValidacionPinException("Espere " + COOLDOWN + " minutos para volver a enviar un PIN");
            }

            eliminar(validacion);
            generarYenviarPIN(email);
        }else{
            //No tiene validaciones
            generarYenviarPIN(email);
        }
    }

    public PinRequestDTO validarPIN(PinValidarDTO dto){
        String email = getEmailNormalizado(dto.email());

        if(!tieneValidacion(email)){
            throw new ValidacionPinException(HttpStatus.FORBIDDEN,"No hay un PIN valido para el mail solicitado " + email);
        }

        ValidacionEmail validacion = getValidacionExistente(email);

        if (validacion.isValidado()) {
            throw new ValidacionPinException(HttpStatus.ALREADY_REPORTED, "El correo ya fue verificado previamente. Continuá con el registro.");
        }

        if(isExpirado(validacion)){
            eliminar(validacion);
            throw new ValidacionPinException("El PIN ingresado caducó. Vuelva a generar un PIN");
        }
        if(intentosRestantes(validacion) <= 0){
            eliminar(validacion);
            throw new ValidacionPinException(HttpStatus.GONE,"Demasiados intentos fallidos, vuelva a generar un PIN");
        }

        if(!passwordEncoder.matches(dto.pin(), validacion.getPinHash())){
            sumarIntento(validacion);
            throw new ValidacionPinException(HttpStatus.CONFLICT,"PIN incorrecto");
        }

        setEmailValido(validacion);

        return PinRequestDTO.builder()
                .email(getEmailNormalizado(email))
                .build();

    }


    public boolean tieneValidacion(String email){
        return validacionEmailRepository.findByEmail(email.trim().toLowerCase()).isPresent();
    }

    public boolean tieneCooldown(ValidacionEmail validacion){
        return LocalDateTime.now().isBefore(validacion.getGeneracion().plusMinutes(COOLDOWN));
    }

    public boolean isExpirado(ValidacionEmail validacion){
        return LocalDateTime.now().isAfter(validacion.getGeneracion().plusMinutes(TTL_PIN));
    }

    public int sumarIntento(ValidacionEmail validacion){
        validacion.setIntentos(validacion.getIntentos()+1);
        validacionEmailRepository.save(validacion);

        return validacion.getIntentos().intValue();
    }

    @Transactional
    public void eliminar(ValidacionEmail validacion){
        validacionEmailRepository.delete(validacion);
    }

    public void eliminar(String email){
        validacionEmailRepository.delete(getValidacionExistente(getEmailNormalizado(email)));
    }

    public boolean isEmailValidado(String email){
        return getValidacionExistente(getEmailNormalizado(email)).isValidado();
    }

    //----------------------METODOS PRIVADOS------------//
    private void generarYenviarPIN(String email){
        String pin = String.format("%06d", random.nextInt(1000000));

        validacionEmailRepository.save(generarValidador(email,pin));

        emailService.mailPinValidacion(getEmailNormalizado(email), pin);
    }

    private ValidacionEmail generarValidador(String email, String pin){
        String pinHash = passwordEncoder.encode(pin);

        return ValidacionEmail.builder()
                .email(getEmailNormalizado(email))
                .pinHash(pinHash)
                .build();
    }

    private ValidacionEmail getValidacionExistente(String email){
        return validacionEmailRepository.findByEmail(getEmailNormalizado(email))
                .orElseThrow(() -> new NotFoundException("El mail no posee un Pin Activo"));
    }

    private int intentosRestantes (ValidacionEmail validacion){
        return (INTENTOS - validacion.getIntentos().intValue());
    }

    private String getEmailNormalizado(String email){
        return email.trim().toLowerCase();
    }

    private void setEmailValido(ValidacionEmail validacion){
        validacion.setValidado(true);
        validacionEmailRepository.save(validacion);
    }


}
