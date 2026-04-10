import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

declare var lucide: any;

@Component({
  selector: 'app-notification-lock',
  templateUrl: './notification-lock.component.html',
  styleUrls: ['./notification-lock.component.scss']
})
export class NotificationLockComponent implements AfterViewInit {
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => lucide.createIcons(), 50);
    }
  }

  onOpenNotification(): void {
    this.router.navigate(['/acceso']);
  }
}
