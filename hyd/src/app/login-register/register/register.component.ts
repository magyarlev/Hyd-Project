import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  #fb = inject(FormBuilder);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #router = inject(Router);
  registerForm: FormGroup;
  #snackBar = inject(MatSnackBar);

  openSnackBar(message: string) {
    this.#snackBar.open(message, 'Close', {
      duration: 2000,
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.#authService
        .registerUser({
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
        })
        .pipe(takeUntilDestroyed(this.#destroyRef))
        .subscribe({
          next: (res) => {
            localStorage.setItem('token', res.token);
            this.#router.navigate(['/login']);
          },
          error: (err) => {
            console.error(err);
            this.openSnackBar(`Error: ${err.error}`);
          },
        });
    }
  }

  constructor() {
    this.registerForm = this.#fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
}
