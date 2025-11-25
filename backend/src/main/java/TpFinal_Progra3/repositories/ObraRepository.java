package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.Obra;
import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ObraRepository extends JpaRepository<Obra, Long>, JpaSpecificationExecutor<Obra> {

    List<Obra> findByCategoria(CategoriaObra categoria);

    List<Obra> findByEstado(EstadoObra estado);

    List<Obra> findByEstudioId(Long estudioId);

    List<Obra> findByNombreContainingIgnoreCase(String nombre);

    List<Obra> findByNombreIgnoreCase(String nombre);

    List<Obra> findByNombreContainingIgnoreCaseAndEstudioId(String nombre, Long estudioId);

    List<Obra> findByNombreEqualsIgnoreCaseAndEstudioId(String nombre, Long estudioId);

    //Devuelve las obras segun un rango de coordenadas
    List<Obra> findByLatitudBetweenAndLongitudBetween(Double latMin, Double latMax, Double lonMin, Double lonMax);

    //AGREGADO EL 1911 PARA PODER BORRAR UNA OBRA Y LOS FAVORITOS QUE APUNTAN A ESTA
    @Modifying
    @Transactional
    @Query(
            value = "DELETE FROM obras_favorito WHERE obra_id = :obraId",
            nativeQuery = true
    )
    void eliminarVinculosPorObra(@Param("obraId") Long obraId);

}
