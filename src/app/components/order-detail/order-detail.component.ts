import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../api/services';
import { DetailOrderReponse } from '../../api/models';
import { CommonModule } from '@angular/common';
import { ApiConfiguration } from '../../api/api-configuration';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
  imports: [CommonModule]
})
export class OrderDetailComponent implements OnInit {
  orderDetail: DetailOrderReponse | null = null;  // Biến lưu thông tin chi tiết đơn hàng
  isLoading = false;  // Biến chỉ thị đang tải
  orderId: number | undefined;  // Đổi kiểu sang number | undefined

  constructor(
    private route: ActivatedRoute,  // Để lấy tham số từ URL
    private orderService: OrderService,  // Dịch vụ lấy thông tin chi tiết đơn hàng
    protected config: ApiConfiguration  // Để lấy cấu hình API (rootUrl)
  ) {}

  ngOnInit(): void {
    this.loadOrderDetail();  // Gọi hàm khi component được khởi tạo
  }

  loadOrderDetail(): void {
    this.isLoading = true;  // Bắt đầu quá trình tải

    // Lấy 'orderId' từ URL
    const orderId = this.route.snapshot.paramMap.get('orderId');

    if (orderId) {
      this.orderId = +orderId;  // Lưu ID đơn hàng

      // Gọi API lấy chi tiết đơn hàng
      this.orderService.apiOrderListDetailOrderGet$Json({ orderId: this.orderId }).subscribe({
        next: (response) => {
          // Xử lý dữ liệu trả về từ API
          if (response?.data) {
            this.orderDetail = response.data as DetailOrderReponse;  // Ép kiểu để sử dụng trong component
          } else {
            console.error('Không có dữ liệu chi tiết cho đơn hàng này.');
            alert('Không có dữ liệu chi tiết cho đơn hàng này.');
          }
          this.isLoading = false;  // Kết thúc quá trình tải
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu chi tiết đơn hàng', err);
          alert('Có lỗi khi tải dữ liệu chi tiết đơn hàng.');
          this.isLoading = false;  // Dừng quá trình tải nếu có lỗi
        }
      });
    } else {
      console.error('Không tìm thấy ID đơn hàng trong URL.');
      alert('Không tìm thấy ID đơn hàng trong URL.');
      this.isLoading = false;  // Dừng quá trình tải nếu không có orderId
    }
  }

  // Hàm trả về mô tả trạng thái của đơn hàng
  getStateDescription(stateId: number): string {
    switch (stateId) {
      case 0: return 'Chờ xử lý';
      case 1: return 'Đã duyệt';
      case 2: return 'Đang vận chuyển';
      case 3: return 'Hoàn thành';
      case 4: return 'Đã hủy';
      default: return 'Chưa xác định';
    }
  }
  

  // Getter cho rootUrl từ cấu hình API
  private _rootUrl?: string;

  get rootUrl(): string {
    return this._rootUrl || this.config.rootUrl;
  }
  
}