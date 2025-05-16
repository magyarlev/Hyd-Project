import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteAStoryComponent } from './write-a-story.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('WriteAStoryComponent', () => {
  let component: WriteAStoryComponent;
  let fixture: ComponentFixture<WriteAStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteAStoryComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(WriteAStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
