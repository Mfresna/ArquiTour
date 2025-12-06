package TpFinal_Progra3.specifications;


import TpFinal_Progra3.model.DTO.filtros.SolicitudFiltroDTO;
import TpFinal_Progra3.model.entities.solicitudes.Solicitud;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class SolicitudSpecification {

    public static Specification<Solicitud> filtrar(SolicitudFiltroDTO filtro) {
        return (root, query, cb) -> {

            Predicate predicate = cb.conjunction();

            // Tipo de solicitud
            if (filtro.getTipo() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("tipo"), filtro.getTipo()));
            }

            // Estado
            if (filtro.getEstado() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("estado"), filtro.getEstado()));
            }

            // Usuario que la generó
            if (filtro.getUsuarioId() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("usuario").get("id"), filtro.getUsuarioId()));
            }

            // Admin asignado
            if (filtro.getAdminAsignadoId() != null) {
                predicate = cb.and(predicate, cb.equal(root.get("adminAsignado").get("id"), filtro.getAdminAsignadoId()));
            }

            // Fecha creación desde
            if (filtro.getFechaDesde() != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("fechaCreacion"), filtro.getFechaDesde()));
            }

            // Fecha creación hasta
            if (filtro.getFechaHasta() != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("fechaCreacion"), filtro.getFechaHasta()));
            }

            // Solo asignadas / solo sin asignar
            if (filtro.getAsignada() != null) {
                if (filtro.getAsignada()) {
                    predicate = cb.and(predicate, cb.isNotNull(root.get("adminAsignado")));
                } else {
                    predicate = cb.and(predicate, cb.isNull(root.get("adminAsignado")));
                }
            }

            return predicate;
        };
    }
}
