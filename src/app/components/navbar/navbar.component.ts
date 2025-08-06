import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgClass, CommonModule } from '@angular/common';
import { CustomerService } from '../../api/services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [NgIf, NgClass, CommonModule]
})
export class NavbarComponent {
  isLoggedIn: boolean = false;
  isDropdownOpen = false;
  cartCount: number = 0;
  isMobileMenuOpen = false; // Kiểm soát menu trên mobile

  constructor(private router: Router, private customerService: CustomerService) {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const customerId = localStorage.getItem('customerId');
    this.isLoggedIn = customerId !== null;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToAccount(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/taikhoan']);
    } else {
      this.router.navigate(['/dangnhap']);
    }
  }

  navigateToOrder(route: string) {
    this.router.navigate(['/lichsudonhang']);
  }

  onAccountIconClick() {
    if (this.isLoggedIn) {
      this.toggleDropdown();
    } else {
      this.router.navigate(['/dangnhap']);
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout() {
    this.customerService.apiCustomerLogoutPost({}).subscribe({
      next: () => {
        localStorage.removeItem('customerId');
        Swal.fire('Đăng xuất thành công', 'Bạn đã đăng xuất!', 'success');
        this.router.navigate(['/dangnhap']);
      },
      error: () => {
        Swal.fire('Đăng xuất thất bại', 'Có lỗi xảy ra.', 'error');
      }
    });
  }



  ngOnInit(): void {
    this.updateCartCount();
  }

  updateCartCount(): void {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    this.cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }
}
