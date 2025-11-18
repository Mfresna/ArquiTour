import { Component } from '@angular/core';
import { TokenService } from '../../auth/services/tokenService/token-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {

  constructor(private tokenService: TokenService) {}

  isLogged(): boolean {
    return this.tokenService.get() !== null;
  }
}
