import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Story, StoryADMIN, StoryDELETE, StoryPOST, StoryPUT } from './types';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  #httpClient = inject(HttpClient);
  #storyUrl = `http://localhost:3000/api/story`;

  getAllStories() {
    return this.#httpClient.get<StoryADMIN[]>(this.#storyUrl);
  }

  getUserStories(userId: string) {}

  getRandomStory(dayType: Story['type']) {
    const params = new HttpParams().set('type', dayType);
    return this.#httpClient.get<Story>(`${this.#storyUrl}/random`, { params });
  }

  addStory(story: StoryPOST) {
    return this.#httpClient.post<void>(this.#storyUrl, story);
  }

  updateStory(story: StoryPUT) {
    return this.#httpClient.put<Story>(this.#storyUrl, story);
  }

  deleteStory(storyId: StoryDELETE['_id']) {
    return this.#httpClient.delete<void>(`${this.#storyUrl}/${storyId}`);
  }
}
