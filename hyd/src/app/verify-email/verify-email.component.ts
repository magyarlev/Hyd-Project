import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';


type VerificationStatus = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Signals
  readonly verificationStatus = signal<VerificationStatus>('loading');
  readonly message = signal<string>('Verifying your email...');
  readonly token = signal<string>('');
  readonly userId = signal<string>('');

  // Computed values
  readonly isLoading = computed(() => this.verificationStatus() === 'loading');
  readonly isSuccess = computed(() => this.verificationStatus() === 'success');
  readonly isError = computed(() => this.verificationStatus() === 'error');

  ngOnInit(): void {
    // Subscribe to query params and verify email
    this.route.queryParams.subscribe((params) => {
      const token = params['token'] ?? '';
      const userId = params['userId'] ?? '';

      this.token.set(token);
      this.userId.set(userId);

      if (!token || !userId) {
        this.verificationStatus.set('error');
        this.message.set('Invalid verification link');
        return;
      }

      this.verifyEmail(token, userId);
    });
  }

  private verifyEmail(token: string, userId: string): void {
    this.authService.verifyEmail(token, userId).subscribe({
      next: (response: any) => {
        this.verificationStatus.set('success');
        this.message.set(
          response.message ||
            'Email verified successfully! Redirecting to login...'
        );

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error: any) => {
        this.verificationStatus.set('error');
        this.message.set(
          error.error || 'Email verification failed. Please try again.'
        );
      },
    });
  }

  resendEmail(): void {
    console.log('Resend email functionality');
  }
}
