import { Component, DestroyRef, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { StoryService } from '../story.service';
import { Story } from '../types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-view-a-story',
  imports: [MatButtonModule],
  templateUrl: './view-a-story.component.html',
  styleUrl: './view-a-story.component.scss',
})
export class ViewAStoryComponent {
  storyService = inject(StoryService);
  story: Signal<Story | undefined> = this.storyService.currentStory;
  getRandomStory(type: 'good' | 'bad') {
    this.storyService.loadRandomStory(type);
  }
}
