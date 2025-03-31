export interface Story {
  id: string;
  type: string;
  content: string;
}

export interface StoryADMIN extends Story {
  email: string;
}

export type StoryPOST = Omit<Story, 'id'>;
export type StoryPUT = StoryPOST;

export type StoryDELETE = Pick<Story, 'id'>;

export type User = {
  email: string;
  password: string;
};
