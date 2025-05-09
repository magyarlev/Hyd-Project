import { Component, DestroyRef, Inject, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoryService } from '../story.service';
import { StoryPOST } from '../types';

@Component({
  selector: 'app-write-a-story',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './write-a-story.component.html',
  styleUrl: './write-a-story.component.scss',
})
export class WriteAStoryComponent {
  #snackBar = inject(MatSnackBar);
  storyForm!: FormGroup;
  storyService = inject(StoryService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);
  typeSelectionErrorMessage: boolean = false;

  ngOnInit() {
    this.storyForm = this.fb.group({
      content: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  #openSnackBar(message: string, action: string) {
    this.#snackBar.open(message, action, { duration: 5000 });
  }

  onSubmit() {
    if (this.storyForm.valid) {
      this.storyService
        .addStory(this.storyForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.#openSnackBar('Story added', 'OK!');
          },
          error: (err) => {
            console.error(err);
            this.#openSnackBar('Error adding story', 'OK!');
          },
        });
    } else {
      this.typeSelectionErrorMessage = true;
    }
  }
}
