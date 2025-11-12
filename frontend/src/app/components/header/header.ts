import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/authService/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  constructor(
    private authService: AuthService
  ){}

cerrarSesion(){
  this.authService.logout();
}
}
