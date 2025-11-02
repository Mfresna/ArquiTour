// src/app/home/home.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { Estudio } from '../../models/estudio.model';
import { EstudiosService } from '../../services/estudios';



// Si usas componentes standalone, importa aquí el CommonModule
@Component({
  selector: 'app-home',
  // ... (otros metadatos)
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent implements OnInit {
  // Lista para almacenar los estudios
  estudios: Estudio[] = [];
  loading = true;
  error: any = null;

  // Inyección del servicio
  private estudiosService = inject(EstudiosService);

  ngOnInit(): void {
    this.cargarEstudios();
  }

  cargarEstudios(): void {
    this.estudiosService.getEstudios().subscribe({
      next: (data) => {
        // 'data' ya está tipada como Estudio[]
        this.estudios = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener los estudios', err);
        this.error = 'No se pudieron cargar los datos. Inténtalo de nuevo más tarde.';
        this.loading = false;
      },
      complete: () => {
        console.log('Carga de estudios completada');
      }
    });
  }
}