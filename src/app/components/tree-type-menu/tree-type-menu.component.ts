import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Category } from '../../api/models';
import { CategoryService } from '../../api/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tree-type-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tree-type-menu.component.html',
  styleUrls: ['./tree-type-menu.component.scss']
})
export class TreeTypeMenuComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string>(); // Phát sự kiện khi loại cây được chọn
  activeButton: string = ''; // Lưu trữ loại cây hiện tại đang được chọn
  listCategoriesDB: Category[] = []; // Danh sách loại cây từ API

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.apiCategoryGetAllGet$Json$Response().subscribe({
      next: (rs: any) => {
        const response = rs.body;
        if (response && response.success) {
          this.listCategoriesDB = response.data?.filter((x: { isActive: any; })=>x.isActive) || []; // Cập nhật danh sách loại cây
        } else {
          console.error('Lấy danh sách danh mục thất bại:', response?.message || 'Không có thông tin thêm.');
        }
      },
      error: (error) => {
        console.error('Lỗi khi gọi API:', error);
      }
    });
  }
  setActive(categoryName: string): void {
    if (!categoryName) {
      console.log('Tên loại cây là null hoặc không xác định.');
      return;
    }
    this.activeButton = categoryName;
    console.log('Loại cây được chọn:', categoryName);
    this.categorySelected.emit(categoryName);
  }
  
  
}
