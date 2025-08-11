import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bancaycanh';
  showFooter = true;

  constructor(public router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Ẩn footer ở trang giỏ hàng (ví dụ /giohang)
        this.showFooter = !event.urlAfterRedirects.includes('/giohang');
      }
    });
  }

  isAuthPage(): boolean {
    return this.router.url === '/dangnhap' || this.router.url === '/dangky' || this.router.url === '/quenmatkhau';
  }
}
