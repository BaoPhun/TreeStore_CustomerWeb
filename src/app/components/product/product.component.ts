import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService, FavoritesService } from '../../api/services';
import { GetListProductSpResult, ProductResponse } from '../../api/models';
import { TreeTypeMenuComponent } from '../tree-type-menu/tree-type-menu.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiConfiguration } from '../../api/api-configuration';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, TreeTypeMenuComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  products: (GetListProductSpResult & { isFavorite?: boolean })[] = [];
  filteredProducts: (GetListProductSpResult & { isFavorite?: boolean })[] = [];

  currentPage = 1;
  itemsPerPage = 8;
  searchTerm = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  product!: ProductResponse;
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
  quantity = 1;

  customerId: number = Number(localStorage.getItem('customerId') || 0);

  constructor(
    private router: Router,
    private productService: ProductService,
    private config: ApiConfiguration,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.listProducts();
  }

  get rootUrl(): string {
    return this.config.rootUrl;
  }

  listProducts(): void {
    this.productService.apiProductListProductGet$Json$Response().subscribe((rs) => {
      const response = rs.body;
      if (response.success) {
        this.products = response.data?.filter(x => x.isActive) ?? [];
        this.filteredProducts = this.products;

        this.favoritesService.apiFavoritesCustomerIdGet$Json({ customerId: this.customerId })
          .subscribe(favRes => {
            console.log('Favorites from API:', favRes.data); // log dữ liệu từ backend

            const favIds = (favRes.data ?? []).map(f => Number(f.productId));
            console.log('Favorite IDs:', favIds); // log chỉ ID

            this.products = this.products.map(p => ({
              ...p,
              isFavorite: favIds.includes(Number(p.productId))
            }));
            console.log('Products after setting isFavorite:', this.products); // log mảng products đã gán isFavorite

            this.filteredProducts = [...this.products]; // copy để trigger change detection
          });
      } else {
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  toggleFavorite(product: any): void {
    const pid = product.productId as number;

    if (product.isFavorite) {
      // Xóa yêu thích
      this.favoritesService.apiFavoritesDelete$Json({ body: { customerId: this.customerId, productId: pid } })
        .subscribe(res => {
          if (res.success) {
            product.isFavorite = false;
            Swal.fire('Đã xóa khỏi yêu thích', '', 'success');
          } else {
            Swal.fire('Lỗi', res.message ?? 'Không thể xóa', 'error');
          }
        });
    } else {
      // Thêm yêu thích
      this.favoritesService.apiFavoritesPost$Json({ body: { customerId: this.customerId, productId: pid } })
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

  addToCart(product: GetListProductSpResult): void {
    const item = {
      id: product.productId,
      name: product.productName,
      price: product.priceOutput,
      quantity: 1,
      imageUrl: this.rootUrl + '/' + product.img,
    };
    const existingItem = this.cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    Swal.fire('Thành công!', 'Sản phẩm đã được thêm vào giỏ hàng!', 'success')
      .then(() => window.location.reload());
  }

  onSearch(): void {
    if ((this.minPrice != null && this.minPrice < 0) || (this.maxPrice != null && this.maxPrice < 0)) {
      Swal.fire('Lỗi', 'Giá tối thiểu và tối đa phải là số không âm.', 'error');
      return;
    }
    const params: any = {};
    if (this.searchTerm.trim() !== '') params.productName = this.searchTerm.trim();
    if (this.minPrice != null) params.minPrice = this.minPrice;
    if (this.maxPrice != null) params.maxPrice = this.maxPrice;

    if (Object.keys(params).length === 0) {
      this.filteredProducts = this.products;
      this.currentPage = 1;
      return;
    }

    this.productService.apiProductSearchProductsGet$Json(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.filteredProducts = response.data ?? [];
          this.currentPage = 1;
        } else {
          this.filteredProducts = [];
          Swal.fire('Thông báo', response.message || 'Không tìm thấy sản phẩm.', 'info');
        }
      },
      error: () => Swal.fire('Lỗi!', 'Có lỗi xảy ra khi tìm kiếm sản phẩm!', 'error'),
    });
  }

  filterProductsByCategory(category: string): void {
    this.selectedCategory = category;
    this.filteredProducts = this.products.filter(
      (product) => product.categoryName === this.selectedCategory
    );
  }
}
