import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { ViewAStoryComponent } from './view-a-story/view-a-story.component';
import { WriteAStoryComponent } from './write-a-story/write-a-story.component';
import { LoginComponent } from './login-register/login/login.component';
import { RegisterComponent } from './login-register/register/register.component';

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
    path: 'auth',
    component: LoginRegisterComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
