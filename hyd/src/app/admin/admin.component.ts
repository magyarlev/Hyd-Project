import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StoryService } from '../story.service';
import { Story, StoryADMIN } from '../types';
import { PopupComponent } from './popup/popup.component';

@Component({
  selector: 'app-admin',
  imports: [MatIcon, MatButtonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  stories: StoryADMIN[] = [];
  #storyService = inject(StoryService);
  #destroyRef = inject(DestroyRef);
  #snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);

  ngOnInit() {
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

  openSnackBar(message: string) {
    this.#snackBar.open(message, 'Close', {
      duration: 2000,
    });
  }

  deleteStory(storyId: Story['_id']) {
    this.#storyService
      .deleteStory(storyId)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: () => {
          const storyIndexToRemove = this.stories.findIndex(
            (story) => story._id === storyId
          );
          this.stories.splice(storyIndexToRemove, 1);
          this.openSnackBar(`${storyId} Story deleted successfully!`);
        },
        error: (err) => {
          console.error(err);
          this.openSnackBar(`Error deleting story: ${storyId}`);
        },
      });
  }

  editStory(story: Story) {
    this.#storyService
      .updateStory(story)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: (result) => {
          const index = this.stories.findIndex((s) => s._id === result._id);
          if (index !== -1) {
            this.stories[index] = { ...this.stories[index], ...story };
          }
          this.openSnackBar(`Story updated: ${story._id}`);
        },
        error: (err) => {
          console.error(err);
          this.openSnackBar(`Error updating story ${story._id}`);
        },
      });
  }

  openDialog(story: Story) {
    const dialogRef = this.dialog.open(PopupComponent, { data: story });

    dialogRef.afterClosed().subscribe((updatedStory) => {
      if (updatedStory) {
        this.editStory(updatedStory);
      }
    });
  }
}
