package TpFinal_Progra3.repositoriesTesters;

import TpFinal_Progra3.model.entities.Favorito;
import TpFinal_Progra3.model.entities.Obra;
import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import TpFinal_Progra3.repositories.FavoritoRepository;
import TpFinal_Progra3.repositories.ObraRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

/**
 * <b>TEST PASSED OK</b>
 */
@SpringBootTest
public class FavoritoRepositoryTest {

    @Autowired
    private FavoritoRepository favoritoRepository;

    @Autowired
    private ObraRepository obraRepository;

    @Test
    void testCargarFavorito(){
        Favorito fav = Favorito.builder()
                .nombreLista("Lista Test")
                //obraRepository ya devuelve una lista de obras
                .obras(obraRepository.findByCategoria(CategoriaObra.ARQ_RESIDENCIAL))
                .build();
        favoritoRepository.save(fav);
    }

    @Test
    void testBuscarNombre(){
        //No puedo printear las obras pq quieren cargar el arquitecto y no lo tienen
        List<Favorito> favorito = favoritoRepository.findByNombreListaIgnoreCase("Lista TEST");
        for(Favorito f : favorito){
            System.out.println(f.getNombreLista());
        }

    }

    @Test
    void testBuscarContieneNombre(){
        //No puedo printear las obras pq quieren cargar el arquitecto y no lo tienen
        List<Favorito> favorito = favoritoRepository.findByNombreListaContainingIgnoreCase("TEST");
        for(Favorito f : favorito){
            System.out.println(f.getNombreLista());
        }
    }

    @Test
    void testContieneObra(){
        //No puedo printear las obras pq quieren cargar el arquitecto y no lo tienen
        Obra obra = obraRepository.findByEstado(EstadoObra.PROYECTO).get(0);
        List<Favorito> favorito = favoritoRepository.findByObrasContaining(obra);
        for(Favorito f : favorito){
            System.out.println(f.getNombreLista());
        }
    }

    @Test
    void testContieneIdObra(){
        //No puedo printear las obras pq quieren cargar el arquitecto y no lo tienen
        Obra obra = obraRepository.findByEstado(EstadoObra.PROYECTO).get(0);
        List<Favorito> favorito = favoritoRepository.findByObras_Id(obra.getId());
        for(Favorito f : favorito){
            System.out.println(f.getNombreLista());
        }
    }



}
