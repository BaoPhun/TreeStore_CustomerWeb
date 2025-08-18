import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService } from '../../api/services';
import { GetListProductSpResult } from '../../api/models';
import { CommonModule } from '@angular/common';
import { ApiConfiguration } from '../../api/api-configuration';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  favorites: (GetListProductSpResult & { isFavorite?: boolean })[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  customerId: number = Number(localStorage.getItem('customerId') || 0);

  constructor(
    private router: Router,
    private favoritesService: FavoritesService,
    private config: ApiConfiguration
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  get rootUrl(): string {
    return this.config.rootUrl;
  }

  loadFavorites(): void {
    this.favoritesService.apiFavoritesCustomerIdGet$Json({ customerId: this.customerId })
      .subscribe(res => {
        if (res.success) {
          this.favorites = (res.data ?? []).map(f => ({
            ...f,
            isFavorite: true   // tất cả item load về đều là favorite
          }));
        } else {
          this.favorites = [];
        }
      });
  }

  toggleFavorite(product: any): void {
    const pid = product.productId as number;
    this.favoritesService.apiFavoritesDelete$Json({ body: { customerId: this.customerId, productId: pid } })
      .subscribe(res => {
        if (res.success) {
          this.favorites = this.favorites.filter(p => p.productId !== pid);
          Swal.fire('Đã xóa khỏi yêu thích', '', 'success');
        } else {
          Swal.fire('Lỗi', res.message ?? 'Không thể xóa', 'error');
        }
      });
  }

  paginatedFavorites(): (GetListProductSpResult & { isFavorite?: boolean })[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.favorites.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get totalPages(): number {
    return Math.ceil(this.favorites.length / this.itemsPerPage) || 1;
  }

  viewDetail(product: GetListProductSpResult): void {
    this.router.navigate(['/xemchitiet', product.productId]);
  }

  addToCart(product: GetListProductSpResult): void {
    const cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const item = {
      id: product.productId,
      name: product.productName,
      price: product.priceOutput,
      quantity: 1,
      imageUrl: this.rootUrl + '/' + product.img,
    };
    const existingItem = cartItems.find(c => c.id === item.id);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cartItems.push(item);
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    Swal.fire('Thành công!', 'Sản phẩm đã được thêm vào giỏ hàng!', 'success');
  }
}
