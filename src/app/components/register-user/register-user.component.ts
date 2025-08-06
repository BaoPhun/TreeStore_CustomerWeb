import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../api/services';
import { CustomerRequest } from '../../api/models';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: true, // Khai báo Standalone Component
  imports: [ReactiveFormsModule,CommonModule], // Thay đổi ở đây
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css']
})
export class RegisterUserComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private customerService: CustomerService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      address: ['']
    });
  }

  ngOnInit(): void {}

  register(): void {
    if (this.registerForm.valid) {
      const customerRequest: CustomerRequest = this.registerForm.value;

      this.customerService.apiCustomerRegisterPost$Json({
        body: customerRequest
      }).subscribe({
        next: (response) => {
          if (response?.success) {
            Swal.fire({
              icon: 'success',
              title: 'Đăng ký thành công!',
              showConfirmButton: false,
              timer: 1500
            });
            setTimeout(() => {
              this.router.navigate(['/dangnhap']);
            }, 1000);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Đăng ký không thành công',
              text: response?.message || 'Có lỗi xảy ra!',
            });
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Có lỗi xảy ra, vui lòng thử lại!'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ thông tin!'
      });
    }
  }
  goToLogin():void{
    this.router.navigate(['/dangnhap'])
  }
}
