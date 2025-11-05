import { Component } from '@angular/core';
import { Login } from "../login/login";
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  imports: [Login, Register],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {

}
