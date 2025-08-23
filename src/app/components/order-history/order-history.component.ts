import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../api/services';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import Router
import { GetListOrderByCustomerIdSpResult } from '../../api/models/get-list-order-by-customer-id-sp-result';
import { GetListOrderByCustomerIdSpResultListResultCustomModel } from '../../api/models/get-list-order-by-customer-id-sp-result-list-result-custom-model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss'],
  imports: [CommonModule],
})
export class OrderHistoryComponent implements OnInit {
  orders: GetListOrderByCustomerIdSpResult[] = [];
  selectedOrder: GetListOrderByCustomerIdSpResult | null = null;
  isLoading = false;
  customerId!: number;
  isModalVisible = false;

  constructor(
    private orderService: OrderService,
    private router: Router  // Thêm Router vào constructor
  ) {}

  ngOnInit(): void {
    const customerIdFromStorage = localStorage.getItem('customerId');
    
    if (customerIdFromStorage) {
      this.customerId = +customerIdFromStorage;
      this.loadOrderHistory();
    } else {
      console.error("Không tìm thấy ID người dùng trong storage.");
    }
  }

  loadOrderHistory(): void {
    if (this.customerId !== undefined) {
      this.isLoading = true;
      this.orderService.apiOrderListOrderByCustomerIdGet$Json({ customerId: this.customerId }).subscribe({
        next: (response: GetListOrderByCustomerIdSpResultListResultCustomModel) => {
          if (response && response.data) {
            const ordersMap = new Map<number, GetListOrderByCustomerIdSpResult>();
  
            response.data.forEach((item) => {
              if (item.orderId !== undefined && !ordersMap.has(item.orderId)) {
                // Chỉ thêm vào Map nếu orderId có giá trị
                ordersMap.set(item.orderId, {
                  orderId: item.orderId,
                  orderDate: item.orderDate,
                  totalAmount: item.totalAmount,
                  state: item.state,
                  isPaid: item.isPaid,
                });
              }
            });
  
            // Chuyển Map thành mảng để gán cho orders
            this.orders = Array.from(ordersMap.values());
          } else {
            this.orders = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu đơn hàng', err);
          this.isLoading = false;
        }
      });
    } else {
      console.error("Không tìm thấy ID người dùng trong storage.");
    }
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/order-detail', orderId]).then((navigation) => {
      if (navigation) {
        console.log('Đã điều hướng thành công');
      } else {
        console.error('Điều hướng thất bại');
      }
    });
  }
  
  
  

  backToList(): void {
    this.selectedOrder = null;
    this.isModalVisible = false;
  }

  getStateText(state?: number): string {
    if (state === undefined) {
      return 'Chưa xác định';
    }

    switch (state) {
      case 0: return 'Đang chờ';
      case 1: return 'Đang xử lý';
      case 2: return 'Chuyển hàng';
      case 3: return 'Đã giao hàng';
      case 4: return 'Đã hủy';
      default: return 'Không xác định';
    }
  }

  closeOrderDetailModal(): void {
    this.isModalVisible = false;
  }

 currentPage = 1;
itemsPerPage = 10;

get paginatedOrders(): GetListOrderByCustomerIdSpResult[] {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.orders.slice(start, start + this.itemsPerPage);
}

get totalPages(): number {
  return Math.ceil(this.orders.length / this.itemsPerPage);
}

changePage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}


}
