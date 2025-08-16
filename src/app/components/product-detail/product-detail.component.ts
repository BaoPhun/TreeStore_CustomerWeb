import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, ProductService, ReviewService } from '../../api/services';
import { BooleanResultCustomModel, ProductResponse, Review } from '../../api/models';
import { CommonModule } from '@angular/common';
import { ApiConfiguration } from '../../api/api-configuration';
import { StrictHttpResponse } from '../../api/strict-http-response';
import Swal from 'sweetalert2';
import { ReviewComponent } from '../review/review-user.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ReviewComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  productId: number = 0;
  product!: ProductResponse;
  rootUrl: string;
  quantity: number = 1;
  listReviewDB: Review[] = [];
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private reviewService: ReviewService,
    private customerService: CustomerService,
    private config: ApiConfiguration
  ) {
    this.rootUrl = config.rootUrl;
  }

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProductDetail();
    this.loadReviews();
  }

  loadProductDetail(): void {
    const params = { productId: this.productId };
    this.productService.apiProductGetProductByIdGet$Json(params).subscribe(
      (response) => {
        if (response.success && response.data) {
          this.product = response.data;
        } else {
          console.error('Không thể lấy thông tin sản phẩm hoặc không có dữ liệu');
        }
      },
      (error) => {
        console.error('Lỗi khi gọi API:', error);
      }
    );
  }

  addToCart(): void {
    const item = {
      id: this.productId,
      name: this.product.name,
      price: this.product.priceOutput,
      quantity: this.quantity,
      imageUrl: this.rootUrl + '/' + this.product.img
    };

    const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }

    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));

    Swal.fire({
      title: 'Thành công!',
      text: 'Sản phẩm đã được thêm vào giỏ hàng!',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  loadReviews(): void {
    const params = { productId: this.productId };
    this.reviewService.apiReviewGetReviewsByProductIdProductIdGet$Json$Response(params).subscribe(
      (rs) => {
        const response = rs.body;
        if (response && response.success) {
          this.listReviewDB = response.data ?? [];
        } else {
          console.error('Lấy danh sách review thất bại!');
        }
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách review:', error);
      }
    );
  }

  // Lấy tên khách hàng hiển thị
  getCustomerName(review: Review): string {
    return review.customer?.fullName ?? 'Người dùng ẩn danh';
  }

  deleteReview(reviewId: number | undefined): void {
    if (!reviewId || reviewId <= 0) {
      Swal.fire('Lỗi!', 'ID đánh giá không hợp lệ.', 'error');
      return;
    }

    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa review này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.reviewService.apiReviewDeleteReviewGetIdDelete$Json$Response({ reviewId, GetId: reviewId.toString() }).subscribe({
          next: (response: StrictHttpResponse<BooleanResultCustomModel>) => {
            const responseBody = response.body;
            if (responseBody && responseBody.success) {
              Swal.fire('Đã xóa!', 'Review đã được xóa thành công.', 'success');
              this.loadReviews();
            } else {
              Swal.fire('Lỗi!', responseBody.message || 'Xóa review không thành công.', 'error');
            }
          },
          error: (error) => {
            console.error('Lỗi khi xóa review:', error);
            Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xóa review.', 'error');
          }
        });
      }
    });
  }

  navigateToReview(): void {
    this.router.navigate(['/danhgia', this.productId]);
  }
}
