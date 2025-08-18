import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService, ProductService, ReviewService, FavoritesService } from '../../api/services';
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
  // 👇 mở rộng ProductResponse để có isFavorite
  product!: ProductResponse & { isFavorite?: boolean };
  rootUrl: string;
  quantity: number = 1;
  listReviewDB: Review[] = [];
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
  customerId: number = Number(localStorage.getItem('customerId') || 0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private reviewService: ReviewService,
    private customerService: CustomerService,
    private favoritesService: FavoritesService, // 👈 thêm service yêu thích
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
          this.product = { ...response.data, isFavorite: false };

          // Gọi API favorites để check sản phẩm này có trong yêu thích không
          this.favoritesService.apiFavoritesCustomerIdGet$Json({ customerId: this.customerId })
            .subscribe(favRes => {
              const favIds = (favRes.data ?? []).map(f => Number(f.productId));
              this.product.isFavorite = favIds.includes(this.productId);
            });

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

    Swal.fire('Thành công!', 'Sản phẩm đã được thêm vào giỏ hàng!', 'success');
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

  toggleFavorite(): void {
    if (!this.customerId) {
      Swal.fire('Thông báo', 'Bạn cần đăng nhập để sử dụng chức năng này', 'info');
      return;
    }

    if (this.product.isFavorite) {
      this.favoritesService.apiFavoritesDelete$Json({ body: { customerId: this.customerId, productId: this.productId } })
        .subscribe(res => {
          if (res.success) {
            this.product.isFavorite = false;
            Swal.fire('Đã xóa khỏi yêu thích', '', 'success');
          } else {
            Swal.fire('Lỗi', res.message ?? 'Không thể xóa', 'error');
          }
        });
    } else {
      this.favoritesService.apiFavoritesPost$Json({ body: { customerId: this.customerId, productId: this.productId } })
        .subscribe(res => {
          if (res.success) {
            this.product.isFavorite = true;
            Swal.fire('Đã thêm vào yêu thích', '', 'success');
          } else {
            Swal.fire('Lỗi', res.message ?? 'Không thể thêm', 'error');
          }
        });
    }
  }
}
