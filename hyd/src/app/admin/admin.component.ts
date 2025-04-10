import { Component, inject } from '@angular/core';
import { Story } from '../types';
import { StoryService } from '../story.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  imports: [MatIcon],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  stories: Story[] = [];
  #storyService = inject(StoryService);

  constructor() {
    this.#storyService
      .getAllStories()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (stories) => {
          this.stories = stories;
        },
        error: (err) => {
          console.error(err);
        },
      });
  }
}
