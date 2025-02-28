import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteAStoryComponent } from './write-a-story.component';

describe('WriteAStoryComponent', () => {
  let component: WriteAStoryComponent;
  let fixture: ComponentFixture<WriteAStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteAStoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteAStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
