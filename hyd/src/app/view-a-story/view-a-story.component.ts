import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { StoryService } from '../story.service';
import { Story } from '../types';

@Component({
  selector: 'app-view-a-story',
  imports: [MatButtonModule],
  templateUrl: './view-a-story.component.html',
  styleUrl: './view-a-story.component.scss',
})
export class ViewAStoryComponent {
  story?: Story;
  storyService = inject(StoryService);
  getBadDayStory() {
    this.storyService
      .getRandomStory()
      .subscribe((story) => (this.story = story));
  }
  getGoodDayStory() {
    this.storyService
      .getRandomStory()
      .subscribe((story) => (this.story = story));
  }
}
