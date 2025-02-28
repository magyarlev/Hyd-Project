import { Routes } from '@angular/router';
import { WriteAStoryComponent } from './write-a-story/write-a-story.component';
import { ViewAStoryComponent } from './view-a-story/view-a-story.component';

export const routes: Routes = [
  {
    path: 'write-a-story',
    component: WriteAStoryComponent,
  },

  {
    path: 'view-a-story',
    component: ViewAStoryComponent,
  },
  {
    path: '',
    component: WriteAStoryComponent,
  },
];
