import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly registerForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [
        '',
        [Validators.required, this.passwordMatchValidator.bind(this)],
      ],
    });
  }

  private passwordMatchValidator(
    control: any
  ): { [key: string]: boolean } | null {
    if (!control.value) {
      return null;
    }
    const password = this.registerForm?.get('password')?.value;
    return password && control.value !== password
      ? { passwordMismatch: true }
      : null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);

      this.authService
        .registerUser({
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.isLoading.set(false);
            this.openSnackBar(
              'Registration successful! Please check your email to verify your account.'
            );
            this.router.navigate(['/auth/login']);
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error(err);
            this.openSnackBar(err);
          },
        });
    }
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}
