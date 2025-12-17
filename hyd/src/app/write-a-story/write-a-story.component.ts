import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoryService } from '../story.service';
import { StoryForm, StoryPOST } from '../types';

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
  storyForm!: FormGroup<StoryForm>;
  storyService = inject(StoryService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);

  typeSelectionErrorMessage: boolean = false;

  ngOnInit() {
    this.storyForm = this.fb.nonNullable.group({
      content: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  #openSnackBar(message: string, action: string) {
    this.#snackBar.open(message, action, { duration: 5000 });
  }

  onSubmit() {
    if (this.storyForm.valid) {
      const story: StoryPOST = {
        content: this.storyForm.getRawValue().content,
        type: this.storyForm.getRawValue().type,
      };
      this.storyService
        .addStory(story)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => {
            this.#openSnackBar('Story added', 'OK!');
            this.storyService.setStory(result);
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
