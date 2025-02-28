import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-write-a-story',
  imports: [MatButtonToggleModule, MatInputModule, FormsModule],
  templateUrl: './write-a-story.component.html',
  styleUrl: './write-a-story.component.scss',
})
export class WriteAStoryComponent {
  story?: string;
}
