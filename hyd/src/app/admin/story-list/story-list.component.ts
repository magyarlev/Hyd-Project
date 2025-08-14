import {
  Component,
  effect,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { StoryADMIN } from '../../types';

@Component({
  selector: 'app-story-list',
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
  ],
  templateUrl: './story-list.component.html',
  styleUrl: './story-list.component.scss',
})
export class StoryListComponent {
  storiesInput = input.required<StoryADMIN[]>();
  stories = new MatTableDataSource<StoryADMIN>([]);
  expandedStory?: StoryADMIN | null;

  columnsToDisplay = ['email', 'type', 'status', 'approve', 'reject'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  selectedStatus = signal<string | null>(null);

  statusChange = output<StoryADMIN>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Ha a storiesInput változik → frissítjük a táblát
    effect(() => {
      const allStories = this.storiesInput();
      const status = this.selectedStatus();

      // Filterelés logikája
      this.stories.data = status
        ? allStories.filter((s) => s.status === status)
        : allStories;

      this.sortByStatus();
    });
  }

  ngAfterViewInit() {
    this.stories.sort = this.sort;
  }

  sortByStatus() {
    this.stories.data = [...this.stories.data].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return a.status.localeCompare(b.status);
    });
  }

  filterByStatus(status: string | null) {
    this.selectedStatus.set(status);
  }

  isExpanded(story: StoryADMIN): boolean {
    return this.expandedStory === story;
  }

  toggle(story: StoryADMIN) {
    this.expandedStory = this.isExpanded(story) ? null : story;
  }

  changeStatus(story: StoryADMIN, status: StoryADMIN['status']) {
    story.status = status;
    this.statusChange.emit(story);
  }
}

export enum StoryStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}
