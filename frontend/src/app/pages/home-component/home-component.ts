import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EstudiosService } from "../../services/estudios";

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class Home implements OnInit {

  constructor(
    public service: EstudiosService
  ) {}

  ngOnInit(): void {
    this.get();
  }

  get() {
    this.service.getProductos().subscribe({
      next: (data) => { this.service.productos = data; },
      error: (e) => { console.log(e); }
    });
  }

  a(){
      navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log(pos);
    },
    (err) => console.error(err)
  );
}


}
