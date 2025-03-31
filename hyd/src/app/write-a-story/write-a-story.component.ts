import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { StoryService } from '../story.service';
import { Story, StoryPOST } from '../types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';

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
          next: () => {},
        });
    }
  }
}
