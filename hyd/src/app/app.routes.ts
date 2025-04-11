import { Routes } from '@angular/router';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { ViewAStoryComponent } from './view-a-story/view-a-story.component';
import { WriteAStoryComponent } from './write-a-story/write-a-story.component';
import { LoginComponent } from './login-register/login/login.component';
import { RegisterComponent } from './login-register/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
  },
  {
    path: 'write-a-story',
    component: WriteAStoryComponent,
    canActivate: [authGuard],
  },

  {
    path: 'view-a-story',
    component: ViewAStoryComponent,
    canActivate: [authGuard],
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
