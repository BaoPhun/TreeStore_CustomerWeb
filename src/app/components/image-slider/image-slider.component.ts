import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule], // Thêm CommonModule vào đây để sử dụng ngClass và các directive khác
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss']
})
export class ImageSliderComponent implements OnInit, OnDestroy {
  images: string[] = [
    'images/icon-leaf.png', // Đường dẫn đến ảnh 1
    'assets/images/image2.jpg', // Đường dẫn đến ảnh 2
    'assets/images/image3.jpg', // Đường dẫn đến ảnh 3
  ];
  currentIndex: number = 0;
  interval: any;

  ngOnInit(): void {
    this.startSlider();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  startSlider() {
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 3000); // Thay đổi ảnh mỗi 3 giây
  }
}
