import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { StoryService } from '../story.service';
import { StoryADMIN } from '../types';
import { AdminComponent } from './admin.component';
import { PopupComponent } from './popup/popup.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockStoryService: jasmine.SpyObj<StoryService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  const mockStories: StoryADMIN[] = [
    { _id: '1', email: 'test1@test.com', content: 'Content 1', type: 'good' },
    { _id: '2', email: 'test2@test.com', content: 'Content 2', type: 'good' },
    { _id: '3', email: 'test3@test.com', content: 'Content 3', type: 'bad' },
  ];

  beforeEach(async () => {
    mockStoryService = jasmine.createSpyObj('StoryService', [
      'deleteStory',
      'getAllStories',
      'openDialog',
    ]);

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockStoryService.getAllStories.and.returnValue(of(mockStories));
    mockStoryService.deleteStory.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: StoryService,
          useValue: mockStoryService,
        },
        {
          provide: MatDialog,
          useValue: mockDialog,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a div with class "story-wrapprer" if there is at least one story', () => {
    const storyWrapperDivs = fixture.debugElement.queryAll(
      By.css('.story-wrapper')
    );
    expect(storyWrapperDivs[0]).toBeTruthy();
    expect(storyWrapperDivs.length).toBe(3);
  });

  it(`should call deleteStory with the first story's id when delete button clicked`, () => {
    spyOn(component, 'deleteStory');
    fixture.detectChanges();
    const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    expect(deleteButton).toBeTruthy();
    deleteButton.triggerEventHandler('click');
    expect(component.deleteStory).toHaveBeenCalledWith(mockStories[0]._id);
  });

  it('should call openDialog with first story when edit button clicked', () => {
    spyOn(component, 'openDialog');
    fixture.detectChanges();
    const editButton = fixture.debugElement.query(By.css('.edit-btn'));
    expect(editButton).toBeTruthy();
    editButton.triggerEventHandler('click');
    expect(component.openDialog).toHaveBeenCalledWith(mockStories[0]);
  });

  it('should render story content', () => {
    component.stories = [
      { _id: '1', email: 'test1@test.com', content: 'Content 1', type: 'good' },
    ];
    fixture.detectChanges();
    const storyConetentDiv = fixture.debugElement.query(By.css('.story-item'));
    expect(storyConetentDiv).toBeTruthy();
    expect(storyConetentDiv.nativeElement.textContent).toContain('Content 1');
  });

  it(`should open the edit dialog with the selected story and call editStory with the result`, () => {
    spyOn(component, 'editStory');
    fixture.detectChanges();
    mockDialog.open.and.returnValue({
      afterClosed: () => of(mockStories[0]),
    } as MatDialogRef<unknown, unknown>);
    const editButton = fixture.debugElement.query(By.css('.edit-btn'));
    editButton.triggerEventHandler('click');
    expect(mockDialog.open).toHaveBeenCalledOnceWith(PopupComponent, {
      data: mockStories[0],
    });
    expect(component.editStory).toHaveBeenCalledOnceWith(mockStories[0]);
  });

  it(`should open the edit dialog with the selected story and NOT call editStory`, () => {
    spyOn(component, 'editStory');
    fixture.detectChanges();
    mockDialog.open.and.returnValue({
      afterClosed: () => of(undefined),
    } as MatDialogRef<unknown, unknown>);
    const editButton = fixture.debugElement.query(By.css('.edit-btn'));
    editButton.triggerEventHandler('click');
    expect(mockDialog.open).toHaveBeenCalledOnceWith(PopupComponent, {
      data: mockStories[0],
    });
    expect(component.editStory).not.toHaveBeenCalled();
  });

  it('should call mockStoryService.deleteStory() story from the list when delete button clicked', () => {
    const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
    const storyToRemoveId = mockStories[0]._id;
    deleteButton.triggerEventHandler('click');
    expect(mockStoryService.deleteStory).toHaveBeenCalledOnceWith(
      storyToRemoveId
    );
    const storyToRemove = component.stories.find(
      (s) => s._id === storyToRemoveId
    );
    expect(storyToRemove).toBeFalsy();
  });
});
