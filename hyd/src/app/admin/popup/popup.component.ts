import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Story } from '../../types';

@Component({
  selector: 'app-popup',
  imports: [MatDialogModule, FormsModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.scss',
})
export class PopupComponent {
  dialogRef = inject(MatDialogRef<PopupComponent>);
  story: Story = inject(MAT_DIALOG_DATA);
  storyContent = this.story.content;
  storyType = this.story.type;

  onSubmit() {
    this.story.content = this.storyContent;
    this.story.type = this.storyType;
    this.dialogRef.close(this.story);
  }
}
