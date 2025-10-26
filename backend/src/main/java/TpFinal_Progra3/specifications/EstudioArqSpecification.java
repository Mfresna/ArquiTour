package TpFinal_Progra3.specifications;

import TpFinal_Progra3.model.DTO.filtros.EstudioArqFiltroDTO;
import TpFinal_Progra3.model.entities.EstudioArq;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class EstudioArqSpecification {

    public static Specification<EstudioArq> filtrar(EstudioArqFiltroDTO filtro) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (filtro.getNombre() != null && !filtro.getNombre().isBlank()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("nombre")), "%" + filtro.getNombre().toLowerCase() + "%"));
            }

            if (filtro.getObraId() != null) {
                Join<Object, Object> joinObras = root.join("obras", JoinType.LEFT);
                predicate = cb.and(predicate, cb.equal(joinObras.get("id"), filtro.getObraId()));
            }

            return predicate;
        };
    }
}
