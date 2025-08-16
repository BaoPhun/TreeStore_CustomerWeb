import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Add CommonModule to imports
  templateUrl: './login-user.component.html',
  styleUrls: ['./login-user.component.css']
})
export class LoginUserComponent implements OnInit {
  loginForm: FormGroup;
  isPasswordVisible: boolean = false;
  isLoggedIn: boolean = false; // Initialize the login status variable

  constructor(private router: Router,
              private http: HttpClient, 
              private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  goToRegister(): void {
    this.router.navigate(['/dangky']);
  }
  
  goToForgotPassword(): void {
    this.router.navigate(['/quenmatkhau']);
  }

  login() {
  if (this.loginForm.valid) {
    const loginData = this.loginForm.value;

    this.http.post('https://localhost:7072/api/Customer/Login', loginData).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const user = response.data;

          // Lưu thông tin cần thiết
          localStorage.setItem('customerId', user.customerId.toString());
          localStorage.setItem('fullname', user.fullName || '');
          localStorage.setItem('phone', user.phone || '');
          localStorage.setItem('address', user.address || '');

          // Nếu có token thì lưu luôn
          if (user.token) {
            localStorage.setItem('token', user.token);
          }

          this.isLoggedIn = true;
          Swal.fire('Đăng nhập thành công', 'Bạn đã đăng nhập thành công!', 'success');
          this.router.navigate(['/home']);
        } else {
          Swal.fire('Đăng nhập thất bại', response.message || 'Sai thông tin đăng nhập', 'error');
        }
      },
      error: () => {
        Swal.fire('Đăng nhập thất bại', 'Có lỗi xảy ra khi đăng nhập.', 'error');
      }
    });
  } else {
    Swal.fire('Thông tin không đầy đủ', 'Vui lòng nhập email và mật khẩu.', 'warning');
  }
}

}