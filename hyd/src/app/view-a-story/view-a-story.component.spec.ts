import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAStoryComponent } from './view-a-story.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('ViewAStoryComponent', () => {
  let component: ViewAStoryComponent;
  let fixture: ComponentFixture<ViewAStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAStoryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewAStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(`should render a div with class "btn-wrapper" with 2 buttons inside it`, () => {
    spyOn(component, 'getRandomStory');
    const buttonWrapper = fixture.debugElement.query(By.css('.btn-wrapper'));
    const buttons = buttonWrapper.queryAll(By.css('button'));
    const getGoodStoryButton = buttons[0];
    const getBadStoryButton = buttons[1];
    getGoodStoryButton.triggerEventHandler('click');
    expect(component.getRandomStory).toHaveBeenCalledWith('good');
    getBadStoryButton.triggerEventHandler('click');
    expect(component.getRandomStory).toHaveBeenCalledWith('bad');
  });
});
