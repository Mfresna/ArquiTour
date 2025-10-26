package TpFinal_Progra3.specifications;

import TpFinal_Progra3.model.DTO.filtros.UsuarioFiltroDTO;
import TpFinal_Progra3.model.entities.Usuario;
import TpFinal_Progra3.security.model.enums.RolUsuario;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

public class UsuarioSpecification {

    public static Specification<Usuario> filtrar(UsuarioFiltroDTO filtro) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (filtro.getNombre() != null && !filtro.getNombre().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("nombre")), "%" + filtro.getNombre().toLowerCase() + "%"));
            }

            if (filtro.getApellido() != null && !filtro.getApellido().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("apellido")), "%" + filtro.getApellido().toLowerCase() + "%"));
            }

            if (filtro.getEmail() != null && !filtro.getEmail().isBlank()) {
                predicate = cb.and(predicate,
                        cb.like(cb.lower(root.get("email")), "%" + filtro.getEmail().toLowerCase() + "%"));
            }

            if (filtro.getIsActivo() != null) {
                predicate = cb.and(predicate,
                        cb.equal(root.get("isActivo"), filtro.getIsActivo()));
            }

            if (filtro.getRol() != null) {
                Join<Object, Object> joinCredencial = root.join("credencial");
                Join<Object, Object> joinRol = joinCredencial.join("roles");
                predicate = cb.and(predicate,
                        cb.equal(joinRol.get("rol"), filtro.getRol()));
            }

            return predicate;
        };
    }
}
