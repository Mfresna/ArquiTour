package TpFinal_Progra3.repositoriesTesters;

import TpFinal_Progra3.model.entities.Obra;
import TpFinal_Progra3.model.enums.CategoriaObra;
import TpFinal_Progra3.model.enums.EstadoObra;
import TpFinal_Progra3.repositories.EstudioArqRepository;
import TpFinal_Progra3.repositories.ObraRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

@SpringBootTest
public class ObrasRespositoryTest {

    @Autowired
    private ObraRepository obraRepository;

    @Autowired
    private EstudioArqRepository estudioArqRepository;

    /**
     * TIENE QUE HABER EN LA BD UN ESTUDIO YA CREADO CON EL ID 1
     */
    @Test
    void testCargarObra(){
        Obra obra = Obra.builder()
                .nombre("Obra Test1")
                .latitud(38.003222)
                .longitud(-57.552778)
                .estado(EstadoObra.PROYECTO)
                .categoria(CategoriaObra.ARQ_RESIDENCIAL)
                //Tiene qu estar dado de alta el estudio para probar
                .estudio(estudioArqRepository.findById(1L).get())
                .build();
        obraRepository.save(obra);
    }

    @Test
    void testBuscarCategoria(){
        //No puedo imprimir el objeto completo pq no tiene imagenes cargadas y se rompe al
        //tratar de recorrer la lista de imagenes
        List<Obra> obras = obraRepository.findByCategoria(CategoriaObra.ARQ_RESIDENCIAL);
        for(Obra o : obras){
            System.out.println(o.getNombre());
        }
    }

    @Test
    void testBuscarEstado(){
        //No puedo imprimir el objeto completo pq no tiene imagenes cargadas y se rompe al
        //tratar de recorrer la lista de imagenes
        List<Obra> obras = obraRepository.findByEstado(EstadoObra.PROYECTO);
        for(Obra o : obras){
            System.out.println(o.getNombre());
        }
    }

    @Test
    void testBuscarEstudio(){
        //No puedo imprimir el objeto completo pq no tiene imagenes cargadas y se rompe al
        //tratar de recorrer la lista de imagenes
        List<Obra> obras = obraRepository.findByEstudioId(1L);
        for(Obra o : obras){
            System.out.println(o.getNombre());
        }
    }

    @Test
    void testContenganNombre(){
        //No puedo imprimir el objeto completo pq no tiene imagenes cargadas y se rompe al
        //tratar de recorrer la lista de imagenes
        List<Obra> obras = obraRepository.findByNombreContainingIgnoreCase("Obra");
        for(Obra o : obras){
            System.out.println(o.getNombre());
        }
    }

    @Test
    void testObraNombre(){
        //No puedo imprimir el objeto completo pq no tiene imagenes cargadas y se rompe al
        //tratar de recorrer la lista de imagenes
        List<Obra> obras = obraRepository.findByNombreIgnoreCase("Obra Test");
        for(Obra o : obras){
            System.out.println(o.getNombre());
        }
    }

    @Test
    void testNombreyEstudio(){
        //No puedo imprimir el objeto completo pq no tiene imagenes cargadas y se rompe al
        //tratar de recorrer la lista de imagenes
        List<Obra> obras = obraRepository.findByNombreContainingIgnoreCaseAndEstudioId("Obra Test",1L);
        for(Obra o : obras){
            System.out.println(o.getNombre());
        }
    }

    @Test
    void testObrasPorArea(){

        //List<Obra> obras = obraRepository.findByLatitudBetweenAndLongitudBetween()
    }

}
