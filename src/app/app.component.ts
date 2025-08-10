import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, FooterComponent,], // Thêm CommonModule ở đây
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bancaycanh';

  constructor(public router: Router) {}

  isAuthPage(): boolean {
    return this.router.url === '/dangnhap' || this.router.url === '/dangky'|| this.router.url === '/quenmatkhau'; // Kiểm tra nếu URL là '/dangnhap' hoặc '/dangky'
  }
}