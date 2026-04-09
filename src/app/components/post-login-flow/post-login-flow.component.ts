import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-post-login-flow',
  templateUrl: './post-login-flow.component.html',
  styleUrls: ['./post-login-flow.component.scss']
})
export class PostLoginFlowComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() completed = new EventEmitter<'review' | 'skip'>();

  phase: 'splash' | 'loading' | 'modal' = 'splash';

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.timers.push(
      setTimeout(() => {
        this.phase = 'loading';
        this.cdr.markForCheck();
      }, 1000)
    );
    this.timers.push(
      setTimeout(() => {
        this.phase = 'modal';
        this.cdr.markForCheck();
        setTimeout(() => this.refreshIcons(), 80);
      }, 3600)
    );
  }

  ngAfterViewInit(): void {
    this.refreshIcons();
  }

  ngOnDestroy(): void {
    this.timers.forEach(t => clearTimeout(t));
  }

  onReview(): void {
    this.completed.emit('review');
  }

  onSkip(): void {
    this.completed.emit('skip');
  }

  private refreshIcons(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        try {
          lucide.createIcons();
        } catch {
          /* noop */
        }
      }, 50);
    }
  }
}
