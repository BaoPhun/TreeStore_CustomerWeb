import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from "sweetalert2";
import { CustomerService, ReviewService } from "../../api/services";
import { ReviewRequest } from "../../api/models";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-review',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './review-user.component.html',
    styleUrls: ['./review-user.component.scss']
})
export class ReviewComponent implements OnInit {
    editReviewUser: FormGroup;
    productId: number | undefined;
    showReviewForm: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private reviewService: ReviewService,
        private fb: FormBuilder,
        private customerService: CustomerService,
    ) {
        this.editReviewUser = this.fb.group({
            customerid: [''],
            productid: [''],
            comment: ['']
        });
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.productId = params['id'];
            this.editReviewUser.patchValue({ productid: this.productId });
        });

        const customerId = this.getCustomerId();
        if (customerId) {
            this.editReviewUser.patchValue({ customerid: customerId });
        }
    }

    toggleReviewForm() {
        this.showReviewForm = !this.showReviewForm;
    }

    onSubmit() {
        if (this.editReviewUser.valid) {
            const newReview: ReviewRequest = {
                customerId: this.getCustomerId(),
                productId: this.editReviewUser.get('productid')?.value || null,
                comment: this.editReviewUser.get('comment')?.value || null,
            };
    
            console.log('Đối tượng mới gửi lên:', newReview);
    
            this.reviewService.apiReviewCreateReviewPost$Json$Response({ body: newReview }).subscribe({
                next: (rs) => {
                    const message = rs.body.message || '';
                    if (rs.body.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Thêm mới bình luận thành công',
                            text: message,
                            confirmButtonText: 'OK'
                            
                        }).then(() => {
                            // Không điều hướng đi đâu, vẫn giữ trang và form
                            this.editReviewUser.reset();  // Làm sạch form nếu muốn
                            window.location.reload();
                            
                        });
                        
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Thêm mới bình luận thất bại',
                            text: message,
                            confirmButtonText: 'OK'
                        });
                    }
                    
                },
                error: (error) => {
                    console.error('Có lỗi xảy ra:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Có lỗi xảy ra',
                        text: error.error?.message || 'Vui lòng kiểm tra lại thông tin',
                        confirmButtonText: 'OK'
                    });
                }
            });
        } else {
            console.log('Form không hợp lệ');
        }
    }
    
    getCustomerId(): number | undefined {
        const customerId = localStorage.getItem('customerId');
        return customerId ? Number(customerId) : undefined;
    }
}
