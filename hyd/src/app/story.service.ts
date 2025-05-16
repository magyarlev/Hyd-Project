import { HttpClient, HttpParams } from '@angular/common/http';
import {
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { Story, StoryADMIN, StoryDELETE, StoryPOST, StoryPUT } from './types';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  #httpClient = inject(HttpClient);
  #storyUrl = `http://localhost:3000/api/story`;
  currentStory: WritableSignal<Story | undefined> = signal<Story | undefined>(
    undefined
  );

  getAllStories() {
    return this.#httpClient.get<StoryADMIN[]>(this.#storyUrl);
  }

  loadRandomStory(dayType: Story['type']) {
    const params = new HttpParams().set('type', dayType);
    this.#httpClient
      .get<Story>(`${this.#storyUrl}/random`, { params })
      .subscribe((story) => {
        this.currentStory.set(story);
      });
  }

  setStory(story: Story) {
    this.currentStory.set(story);
  }

  addStory(story: StoryPOST) {
    return this.#httpClient.post<Story>(this.#storyUrl, story);
  }

  updateStory(story: StoryPUT) {
    return this.#httpClient.put<Story>(this.#storyUrl, story);
  }

  deleteStory(storyId: StoryDELETE['_id']) {
    return this.#httpClient.delete<void>(`${this.#storyUrl}/${storyId}`);
  }
}
