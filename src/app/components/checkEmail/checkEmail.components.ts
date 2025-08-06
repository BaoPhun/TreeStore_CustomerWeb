import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../api/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkEmail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Import ReactiveFormsModule
  templateUrl: './checkEmail.component.html',
  styleUrls: ['./checkEmail.component.css']
})
export class OtpVerificationComponent {
  otpForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustomerService
  ) {
    // Khởi tạo form với các trường cần thiết
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]], // Trường OTP
      newPassword: ['', [Validators.required, Validators.minLength(6)]] // Trường mật khẩu mới
    });
  }

  verifyOtp() {
    if (this.otpForm.invalid) {
      return;
    }

    // Lấy giá trị từ form
    const otp = this.otpForm.get('otp')?.value;
    const newPassword = this.otpForm.get('newPassword')?.value;

    // Gọi API ResetPassword với otp và newPassword (không cần email)
    this.customerService.apiCustomerResetPasswordResetPasswordPost$Json$Response({ otp, newPassword }).subscribe({
      next: (response) => {
        const result = response.body;
        if (result?.success) {
          this.successMessage = result.message || 'Mật khẩu đã được cập nhật thành công!';
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        } else {
          // Nếu API trả về lỗi mật khẩu cũ trùng với mật khẩu mới
          if (result?.message === 'Mật khẩu mới không được trùng với mật khẩu cũ') {
            this.errorMessage = 'Mật khẩu mới không được trùng với mật khẩu cũ!';
          } else {
            this.errorMessage = result?.message || 'Có lỗi xảy ra.';
          }
        }
      },
      error: () => {
        this.errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại!';
      }
    });
  }
}
