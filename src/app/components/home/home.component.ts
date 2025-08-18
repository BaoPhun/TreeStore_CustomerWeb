import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, FavoritesService } from '../../api/services';
import { GetListProductSpResult } from '../../api/models';
import { ApiConfiguration } from '../../api/api-configuration';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  products: (GetListProductSpResult & { isFavorite?: boolean })[] = [];
  filteredProducts: (GetListProductSpResult & { isFavorite?: boolean })[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 4;
  searchTerm: string = '';
  selectedCategory: string = '';
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
  quantity: number = 1;
  hotProducts: (GetListProductSpResult & { isFavorite?: boolean })[] = [];

  customerId: number = Number(localStorage.getItem('customerId') || 0);

  constructor(
    private router: Router,
    private productService: ProductService,
    private favoritesService: FavoritesService,
    private config: ApiConfiguration
  ) {}

  ngOnInit(): void {
    this.listProducts();
    this.listHotProducts();
  }

  get rootUrl(): string {
    return this.config.rootUrl;
  }

  listProducts(): void {
    this.productService.apiProductListProductGet$Json$Response().subscribe(rs => {
      const response = rs.body;
      if (response.success) {
        this.products = response.data?.filter(x => x.isActive) ?? [];
        this.filteredProducts = [...this.products];

        // Lấy danh sách yêu thích
        if (this.customerId) {
          this.favoritesService.apiFavoritesCustomerIdGet$Json({ customerId: this.customerId })
            .subscribe(favRes => {
              const favIds = (favRes.data ?? []).map(f => Number(f.productId));
              this.products = this.products.map(p => ({
                ...p,
                isFavorite: favIds.includes(Number(p.productId))
              }));
              this.filteredProducts = [...this.products];
            });
        }
      } else {
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  paginatedProducts(): (GetListProductSpResult & { isFavorite?: boolean })[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  viewDetail(product: GetListProductSpResult): void {
    this.router.navigate(['/xemchitiet', product.productId]);
  }

  gotoProduct(): void {
    this.router.navigate(['/sanpham']);
  }

  onSearch(): void {
    this.filteredProducts = this.searchTerm.trim()
      ? this.products.filter(product =>
          product.productName?.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : [...this.products];
    this.currentPage = 1;
  }

  filterProductsByCategory(category: string): void {
    this.selectedCategory = category;
    this.filteredProducts = this.products.filter(product =>
      product.categoryName === this.selectedCategory
    );
    this.currentPage = 1;
  }

  addToCart(product: GetListProductSpResult): void {
    const item = {
      id: product.productId,
      name: product.productName,
      price: product.priceOutput,
      quantity: this.quantity,
      imageUrl: this.rootUrl + '/' + product.img
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

  toggleFavorite(product: GetListProductSpResult & { isFavorite?: boolean }): void {
    if (!this.customerId) {
      Swal.fire('Thông báo', 'Bạn cần đăng nhập để sử dụng chức năng này', 'info');
      return;
    }

    if (product.isFavorite) {
      this.favoritesService.apiFavoritesDelete$Json({ body: { customerId: this.customerId, productId: product.productId } })
        .subscribe(res => {
          if (res.success) {
            product.isFavorite = false;
            Swal.fire('Đã xóa khỏi yêu thích', '', 'success');
          } else {
            Swal.fire('Lỗi', res.message ?? 'Không thể xóa', 'error');
          }
        });
    } else {
      this.favoritesService.apiFavoritesPost$Json({ body: { customerId: this.customerId, productId: product.productId } })
        .subscribe(res => {
          if (res.success) {
            product.isFavorite = true;
            Swal.fire('Đã thêm vào yêu thích', '', 'success');
          } else {
            Swal.fire('Lỗi', res.message ?? 'Không thể thêm', 'error');
          }
        });
    }
  }


  listHotProducts(): void {
      this.productService.apiProductGetTopSellingProductsTopSellingGet$Json()
        .subscribe(res => {
          if (res.success) {
            // Lấy 5 sản phẩm bán chạy nhất
            this.hotProducts = res.data?.slice(0, 3).map(p => ({ ...p, isFavorite: false })) ?? [];

            if (this.customerId) {
              this.favoritesService.apiFavoritesCustomerIdGet$Json({ customerId: this.customerId })
                .subscribe(favRes => {
                  const favIds = (favRes.data ?? []).map(f => Number(f.productId));
                  this.hotProducts = this.hotProducts.map(p => ({
                    ...p,
                    isFavorite: favIds.includes(Number(p.productId))
                  }));
                });
            }
          } else {
            this.hotProducts = [];
          }
        });
    }
}
