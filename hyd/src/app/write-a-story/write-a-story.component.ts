import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './write-a-story.component.html',
  styleUrl: './write-a-story.component.scss',
})
export class WriteAStoryComponent {
  #snackBar = inject(MatSnackBar);

  #openSnackBar(message: string, action: string) {
    this.#snackBar.open(message, action, { duration: 5000 });
  }

  story: StoryPOST = {
    type: '',
    content: '',
  };

  storyService = inject(StoryService);
  destroyRef = inject(DestroyRef);

  onSubmit() {
    if (this.story) {
      this.storyService
        .addStory(this.story)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.#openSnackBar('Story added', 'OK!');
          },
        });
    }
  }
}
