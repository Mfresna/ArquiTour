package TpFinal_Progra3.repositories;

import TpFinal_Progra3.model.entities.Favorito;
import TpFinal_Progra3.model.entities.Obra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;


@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {

    List<Favorito> findByNombreListaIgnoreCase(String nombreLista);
    List<Favorito> findByNombreListaContainingIgnoreCase(String nombreLista);

    List<Favorito> findByObrasContaining(Obra obra);
    List<Favorito> findByObras_Id(Long obraId);

}
