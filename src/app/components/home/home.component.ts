import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BannerSliderComponent } from '../banner-slider/banner-slider.component';
import { ImageSliderComponent } from '../image-slider/image-slider.component';
import { ProductService } from '../../api/services';
import { GetListProductSpResult, ProductResponse } from '../../api/models';
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
  products: GetListProductSpResult[] = [];
  filteredProducts: GetListProductSpResult[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 4; // Số sản phẩm trên mỗi trang là 4
  searchTerm: string = '';
  selectedCategory: string = '';
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
  quantity: number = 1;
  noProducts = false;

  constructor(
    private router: Router,
    private productService: ProductService,
    private config: ApiConfiguration
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
          this.products = response.data?.filter(x=>x.isActive) ?? [];
          this.filteredProducts = this.products;
        } else {
          this.products = [];
          this.filteredProducts = [];
        }
      });
  }
  paginatedProducts(): GetListProductSpResult[] {
    const startIndex = Math.max(0, this.filteredProducts.length - this.currentPage * this.itemsPerPage);
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage).reverse();
  }
  

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  viewDetail(product: GetListProductSpResult): void {
    this.router.navigate(['/xemchitiet', product.productId]);
  }
gotoProduct():void{
  this.router.navigate(['/sanpham']);
}
  onSearch(): void {
    this.filteredProducts = this.searchTerm.trim()
      ? this.products.filter(product =>
          product.productName?.toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      : this.products;
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

    Swal.fire({
      title: 'Thành công!',
      text: 'Sản phẩm đã được thêm vào giỏ hàng!',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
  gotoProductPage() :void{
    this.router.navigate(['/sanpham']);
  }
}