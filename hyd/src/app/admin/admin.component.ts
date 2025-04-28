import { Component, DestroyRef, inject } from '@angular/core';
import { Story } from '../types';
import { StoryService } from '../story.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin',
  imports: [MatIcon],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  stories: Story[] = [];
  #storyService = inject(StoryService);
  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);

  ngOnInit() {
    if (this.#authService.isAdmin()) {
      this.#storyService
        .getAllStories()
        .pipe(takeUntilDestroyed(this.#destroyRef))
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
}
