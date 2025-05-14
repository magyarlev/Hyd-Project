import { Form, FormControl } from '@angular/forms';

export interface Story {
  _id: string;
  type: string;
  content: string;
}

export interface StoryADMIN extends Story {
  email: string;
}

export type StoryPOST = Omit<Story, '_id'>;
export type StoryPUT = StoryPOST;

export type StoryDELETE = Pick<Story, '_id'>;

export interface StoryForm {
  type: FormControl<string>;
  content: FormControl<string>;
}

export type User = {
  email: string;
  password: string;
  role: string;
};

export type UserPOST = Omit<User, 'role'>;
