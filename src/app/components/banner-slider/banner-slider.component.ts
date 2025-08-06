import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-banner-slider',
  standalone: true,
  imports: [CommonModule], // Thêm CommonModule vào đây để sử dụng ngClass và các directive khác
  templateUrl: './banner-slider.component.html',
  styleUrls: ['./banner-slider.component.scss']
})
export class BannerSliderComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}
  
  images: string[] = [
    'images/banner6.png',
    'images/banner6.png',
    'images/banner6.png'
  ];
  
  overlayImages: string[] = [
    'images/bannerTree1.png',
    'images/bannerTree2.png',
    'images/bannerTree3.png'
  ];

  currentIndex: number = 0;
  intervalId: any;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  plusSlides(n: number): void {
    this.currentIndex += n;
    if (this.currentIndex < 0) {
      this.currentIndex = this.images.length - 1;
    } else if (this.currentIndex >= this.images.length) {
      this.currentIndex = 0;
    }
  }

  getCurrentImage(): string {
    return this.images[this.currentIndex];
  }

  getCurrentOverlayImage(): string {
    return this.overlayImages[this.currentIndex];
  }
  getOverlayClass(): string {
    switch (this.currentIndex) {
      case 0:
        return 'overlay-class-1'; // Class cho overlay đầu tiên
      case 1:
        return 'overlay-class-2'; // Class cho overlay thứ hai
      case 2:
        return 'overlay-class-3'; // Class cho overlay thứ ba
      default:
        return ''; // Trả về lớp mặc định nếu không có lớp nào khớp
    }
  }
  
  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.plusSlides(1);
    }, 3000);
  }

  viewProduct() {
    this.router.navigate(['/sanpham']);
  }
  viewLienHe() {
    this.router.navigate(['/lienhe']);
  }
}
