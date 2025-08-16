import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, PromotionService } from '../../api/services';
import { CreateOrderRequest, Int32ResultCustomModel } from '../../api/models';
import { StrictHttpResponse } from '../../api/strict-http-response';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  cartItems: any[] = [];
  shippingInfo = { name: '', phone: '', address: '' };
  orderNote: string = '';
  promotionCode: string = '';
  isPromotionValid: boolean = true;
  discountAmount: number = 0;
  finalAmount: number = 0;

  constructor(
    private router: Router,
    private orderService: OrderService,
    private promotionService: PromotionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { cartItems: any[] };
    this.cartItems = state?.cartItems || JSON.parse(localStorage.getItem('cartItems') || '[]');

    this.shippingInfo.name = localStorage.getItem('fullname') || '';
    this.shippingInfo.phone = localStorage.getItem('phone') || '';
    this.shippingInfo.address = localStorage.getItem('address') || '';
  }

  checkPromotionCode() {
    const totalAmount = this.cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    );

    if (!this.promotionCode) {
      this.isPromotionValid = true;
      this.discountAmount = 0;
      this.finalAmount = totalAmount;
      return;
    }

    this.promotionService.apiPromotionCheckPromotionCodePost$Json$Response({
      body: { promotionCode: this.promotionCode, totalAmount }
    }).subscribe(
      (res: any) => {
        const data = res?.body?.data;
        if (!data) {
          this.isPromotionValid = false;
          this.discountAmount = 0;
          this.finalAmount = totalAmount;

          Swal.fire({
            title: 'Mã giảm giá không hợp lệ',
            text: 'Vui lòng kiểm tra lại mã và thử lại.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        this.isPromotionValid = true;
        this.discountAmount = data.discountAmount || 0;
        this.finalAmount = data.finalAmount || totalAmount;

        Swal.fire({
          title: 'Mã giảm giá hợp lệ',
          text: 'Áp mã thành công',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      },
      (error) => {
        this.isPromotionValid = false;
        this.discountAmount = 0;
        this.finalAmount = totalAmount;

        Swal.fire({
          title: 'Lỗi khi kiểm tra mã',
          text: 'Không thể xác thực mã giảm giá. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonText: 'OK'
        });

        this.cdr.detectChanges();
      }
    );
  }

  get total() {
    const totalAmount = this.cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    );
    return this.finalAmount > 0 ? this.finalAmount : totalAmount;
  }

  submitOrder() {
  const customerId = parseInt(localStorage.getItem('customerId') || '0');
  if (!customerId || isNaN(customerId)) {
    console.error('Customer ID không hợp lệ');
    return;
  }

  const orderRequest: CreateOrderRequest = {
    cartItems: this.cartItems.map(item => ({
      productId: item.productId || item.id,
      quantity: item.quantity
    })),
    customerId,
    note: this.orderNote,
    promotionCode: this.promotionCode || ''
  };

  Swal.fire({
    title: 'Xác nhận đặt hàng',
    text: 'Bạn có chắc chắn muốn đặt hàng?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Đặt hàng',
    cancelButtonText: 'Hủy'
  }).then((result) => {
    if (!result.isConfirmed) return;

    // Dùng kiểu StrictHttpResponse<Int32ResultCustomModel> đúng với API
    this.orderService.apiOrderCreatePost$Json$Response({ body: orderRequest })
      .subscribe((response: StrictHttpResponse<Int32ResultCustomModel>) => {
        const body = response.body;
        if (body?.success && body?.data && body.data > 0) {
          Swal.fire({
            title: 'Đặt hàng thành công!',
            text: 'Đơn hàng của bạn đã được xác nhận.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            localStorage.removeItem('cartItems');
            this.router.navigate(['/sanpham']);
          });
        } else {
          Swal.fire({
            title: 'Đặt hàng không thành công',
            text: body?.message || 'Đã có lỗi xảy ra',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }, (error) => {
        Swal.fire({
          title: 'Lỗi',
          text: error?.message || 'Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error('Lỗi khi đặt hàng:', error);
      });
  });
}


  formatCurrency(value: number): string {
    if (isNaN(value)) return '0đ';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}
