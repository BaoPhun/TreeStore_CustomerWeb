import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../api/services';
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
  products: GetListProductSpResult[] = [];
  filteredProducts: GetListProductSpResult[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  searchTerm: string = '';
  selectedCategory: string = ''; // Lưu loại cây được chọn
  productId: number = 0;
  minPrice: number | null = null; // Thêm giá tối thiểu
  maxPrice: number | null = null; // Thêm giá tối đa
  product!: ProductResponse;
  cartItems: any[] = JSON.parse(localStorage.getItem('cartItems') || '[]');

  quantity: number = 1; // Khai báo số lượng

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
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
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
    // Chuyển hướng đến trang chi tiết sản phẩm và truyền thông tin sản phẩm
    this.router.navigate(['/xemchitiet', product.productId]); // Thay đổi product.id thành ID của sản phẩm
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
  
    Swal.fire({
      title: 'Thành công!',
      text: 'Sản phẩm đã được thêm vào giỏ hàng!',
      icon: 'success',
      confirmButtonText: 'OK',
    }).then(() => {
      // Tải lại trang sau khi người dùng đóng thông báo
      window.location.reload();
    });
  }
  
  
  onSearch(): void {
    // Tạo object chứa các tham số tìm kiếm
    const params: any = {};
    
    // Thêm các tham số tìm kiếm vào object params
    if (this.searchTerm.trim() !== '') {
      params.productName = this.searchTerm;  // Tên sản phẩm
    }
  
    if (this.minPrice != null) {
      params.minPrice = this.minPrice;  // Giá tối thiểu
    }
  
    if (this.maxPrice != null) {
      params.maxPrice = this.maxPrice;  // Giá tối đa
    }
  
    // Kiểm tra xem có ít nhất một tham số tìm kiếm được nhập không
    if (Object.keys(params).length === 0) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng nhập từ khóa  để tìm kiếm!',
        icon: 'info',
        confirmButtonText: 'OK',
      });
      return;
    }
  
    // Gọi API tìm kiếm sản phẩm
    this.productService.apiProductSearchProductsGet$Json(params
    ).subscribe(
      (response) => {
        console.log('Search response:', response);
        // Lọc danh sách sản phẩm theo kết quả trả về
        this.filteredProducts = response.data ?? [];
        this.currentPage = 1; // Reset lại trang khi tìm kiếm
      },
      (error) => {
        console.error('Error while searching products', error);
        Swal.fire({
          title: 'Lỗi!',
          text: 'Có lỗi xảy ra khi tìm kiếm sản phẩm!',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }
  

  filterProductsByCategory(category: string): void {
    this.selectedCategory = category;
    this.filteredProducts = this.products.filter(
      (product) => product.categoryName === this.selectedCategory
    );
    // this.currentPage = 1;
  }
}
