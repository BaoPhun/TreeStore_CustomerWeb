import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports:[FormsModule,CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]'); // Lấy sản phẩm từ localStorage
  constructor(private router: Router) {}

  get total() {
    return this.cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  removeItem(itemId: number) {
    // Hiển thị xác nhận xóa bằng SweetAlert2
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Sản phẩm này sẽ bị xóa khỏi giỏ hàng!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        // Xóa sản phẩm khỏi giỏ hàng và cập nhật lại localStorage
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

        // Thông báo sau khi xóa thành công
        Swal.fire('Đã xóa!', 'Sản phẩm đã được xóa khỏi giỏ hàng.', 'success');
      }
    });
  }

  updateQuantity(itemId: number, quantity: number) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('cartItems', JSON.stringify(this.cartItems)); // Cập nhật lại localStorage
    }
  }

  clearCart() {
    // Xác nhận xóa toàn bộ giỏ hàng
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa giỏ hàng?',
      text: 'Tất cả sản phẩm sẽ bị xóa khỏi giỏ hàng!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa hết',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartItems = []; // Xóa giỏ hàng
        localStorage.removeItem('cartItems'); // Xóa giỏ hàng trong localStorage
        Swal.fire('Đã xóa!', 'Giỏ hàng đã được làm trống.', 'success');
      }
    });
  }

  buyNow() {
    this.router.navigate(['/dathang'], { state: { items: this.cartItems } });
  }

  formatCurrency(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}