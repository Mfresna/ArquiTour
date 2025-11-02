import { Component, OnInit } from '@angular/core';
import { Estudio } from '../../models/estudio.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EstudiosService } from '../../services/estudios';

@Component({
  selector: 'app-detalle',
  imports: [],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class Detalle implements OnInit {

  item?: Estudio;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public service: EstudiosService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.get(id);
  }

  get(id: string): void {
    this.service.getProducto(id).subscribe({
      next: (data) => { this.item = data; },
      error: (e) => { console.error(e); }
    });
  }

}