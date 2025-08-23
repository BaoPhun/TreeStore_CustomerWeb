import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, PromotionService } from '../../api/services';
import { CreateOrderRequest, Int32ResultCustomModel } from '../../api/models';
import { StrictHttpResponse } from '../../api/strict-http-response';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var paypal: any; // khai báo global PayPal

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

  // 🌟 biến phương thức thanh toán
  selectedPaymentMethod: string = 'cod'; // mặc định COD

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
          Swal.fire({ title: 'Mã giảm giá không hợp lệ', text: 'Vui lòng kiểm tra lại mã và thử lại.', icon: 'error', confirmButtonText: 'OK' });
          return;
        }
        this.isPromotionValid = true;
        this.discountAmount = data.discountAmount || 0;
        this.finalAmount = data.finalAmount || totalAmount;
        Swal.fire({ title: 'Mã giảm giá hợp lệ', text: 'Áp mã thành công', icon: 'success', confirmButtonText: 'OK' });
      },
      (error) => {
        this.isPromotionValid = false;
        this.discountAmount = 0;
        this.finalAmount = totalAmount;
        Swal.fire({ title: 'Lỗi khi kiểm tra mã', text: 'Không thể xác thực mã giảm giá. Vui lòng thử lại.', icon: 'error', confirmButtonText: 'OK' });
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

onPaymentMethodChange() {
  if (this.selectedPaymentMethod === 'paypal') {
    setTimeout(() => this.payWithPaypal(), 0); // render nút PayPal
  } else {
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = ''; // xóa nút khi đổi phương thức
  }
}

submitOrder() {
  if (!this.selectedPaymentMethod) {
    Swal.fire({ title: 'Vui lòng chọn phương thức thanh toán!', icon: 'warning', confirmButtonText: 'OK' });
    return;
  }

  if (this.selectedPaymentMethod !== 'paypal') {
    this.placeOrder(); // COD / Card
  }
  // PayPal: nút đã hiện, người dùng bấm nút PayPal sẽ tự gọi placeOrder()
}




  placeOrder(isPaid: boolean = false) {  // mặc định false cho COD / Card
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
    promotionCode: this.promotionCode || '',
    isPaid: isPaid
  };

  // Gửi isPaid thông qua backend
  this.orderService.apiOrderCreatePost$Json({ body: orderRequest }).subscribe(
    () => {
      Swal.fire('Đặt hàng thành công', '', 'success').then(() => {
        localStorage.removeItem('cartItems');
        this.router.navigate(['/sanpham']);
      });
    },
    (err) => Swal.fire('Lỗi', 'Không thể tạo đơn hàng', 'error')
  );
}


  payWithPaypal() {
  const self = this;
  const totalUSD = (this.total / 23000).toFixed(2);

  paypal.Buttons({
    createOrder(data: any, actions: any) {
      return actions.order.create({
        purchase_units: [{ amount: { value: totalUSD } }]
      });
    },
    onApprove(data: any, actions: any) {
      return actions.order.capture().then(function(details: any) {
        Swal.fire('Thanh toán thành công', `Cảm ơn ${details.payer.name.given_name}`, 'success');
        self.placeOrder(true); 
      });
    },
    onError(err: any) {
      Swal.fire('Thanh toán thất bại', err.message || '', 'error');
    }
  }).render('#paypal-button-container');
}



  formatCurrency(value: number): string {
    if (isNaN(value)) return '0đ';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }
}
