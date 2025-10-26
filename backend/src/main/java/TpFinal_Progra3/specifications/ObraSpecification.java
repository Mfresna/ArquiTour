package TpFinal_Progra3.specifications;

import TpFinal_Progra3.model.entities.Obra;
import TpFinal_Progra3.model.DTO.filtros.ObraFiltroDTO;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

public class ObraSpecification {

    public static Specification<Obra> filtrar(ObraFiltroDTO filtro) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction(); // empiezo con un `true`

            if (filtro.getCategoria() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("categoria"), filtro.getCategoria()));
            }

            if (filtro.getEstado() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("estado"), filtro.getEstado()));
            }

            if (filtro.getEstudioId() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("estudio").get("id"), filtro.getEstudioId()));
            }

            return predicate;
        };
    }
}
