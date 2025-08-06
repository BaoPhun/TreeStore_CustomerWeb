import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

import { CustomerService } from '../../api/services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Add ReactiveFormsModule to imports
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorMessage: string = '';  // Để hiển thị lỗi nếu có
  successMessage: string = '';  // Để hiển thị thông báo thành công

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerService // Inject CustomerService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  // Chuyển hướng đến trang đăng nhập
  goToLogin(): void {
    this.router.navigate(['/dangnhap']);
  }

  // Hàm xử lý submit form quên mật khẩu
  submitForgotPassword(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
  
    const email: string = this.forgotPasswordForm.get('email')?.value ?? '';
  
    if (email === '') {
      this.errorMessage = 'Email không hợp lệ';
      return;
    }
  
    this.customerService.apiCustomerForgotPasswordForgotPasswordPost$Json$Response({ email }).subscribe({
      next: (response) => {
        const result = response.body;
        if (result?.success) {
          this.successMessage = result.message ?? '';
          this.router.navigate(['/checkEmail']); // Chuyển hướng đến trang check email
        } else {
          this.errorMessage = result?.message ?? 'Có lỗi xảy ra';
        }
      },
      error: () => {
        this.errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại!';
      }
    });
  }
  
}
