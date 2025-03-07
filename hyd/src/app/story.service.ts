import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Story, StoryADMIN, StoryDELETE, StoryPOST, StoryPUT } from './types';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  #httpClient = inject(HttpClient);
  #storyUrl = `http://localhost:3000/story`;

  getAllStories() {
    return this.#httpClient.get<StoryADMIN[]>(this.#storyUrl);
  }

  getRandomStory() {
    return this.#httpClient.get<Story>(`${this.#storyUrl}/random`);
  }

  addStory(story: StoryPOST) {
    return this.#httpClient.post<Story>(this.#storyUrl, story);
  }

  updateStory(story: StoryPUT) {
    return this.#httpClient.put<Story>(this.#storyUrl, story);
  }

  deleteStory(storyId: StoryDELETE) {
    return this.#httpClient.delete<void>(`${this.#storyUrl}/${storyId}`);
  }
}
