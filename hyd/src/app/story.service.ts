import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Story } from './types';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  #httpClient = inject(HttpClient);
  #storyUrl = `localhost:3000/story`;

  getAllStories() {
    return this.#httpClient.get<Story[]>(this.#storyUrl);
  }

  getRandomStory() {
    return this.#httpClient.get<Story>(`${this.#storyUrl}/random`);
  }

  addStory(story: Story) {
    return this.#httpClient.post<Story>(this.#storyUrl, story);
  }

  updateStory(story: Story) {
    return this.#httpClient.put<Story>(this.#storyUrl, story);
  }

  deleteStory(story: Story) {
    return this.#httpClient.delete<Story>(`${this.#storyUrl}/${story.id}`);
  }
}
