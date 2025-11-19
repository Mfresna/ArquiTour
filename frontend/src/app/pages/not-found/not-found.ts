import { Component } from '@angular/core';
import { TokenService } from '../../auth/services/tokenService/token-service';


@Component({
  selector: 'app-not-found',
  imports: [ ],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {


  constructor(private tokenService: TokenService) {}

  isLogged(): boolean {
    return this.tokenService.get() !== null;
  }
}
