import { Component, EventEmitter, Output, AfterViewInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-notification-lock',
  templateUrl: './notification-lock.component.html',
  styleUrls: ['./notification-lock.component.scss']
})
export class NotificationLockComponent implements AfterViewInit {
  @Output() openFromNotification = new EventEmitter<void>();

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => lucide.createIcons(), 50);
    }
  }

  onOpenNotification(): void {
    this.openFromNotification.emit();
  }
}
