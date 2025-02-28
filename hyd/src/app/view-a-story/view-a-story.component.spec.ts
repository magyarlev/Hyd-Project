import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAStoryComponent } from './view-a-story.component';

describe('ViewAStoryComponent', () => {
  let component: ViewAStoryComponent;
  let fixture: ComponentFixture<ViewAStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAStoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
