import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

declare var lucide: any;

@Component({
  selector: 'app-notification-lock',
  templateUrl: './notification-lock.component.html',
  styleUrls: ['./notification-lock.component.scss']
})
export class NotificationLockComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    if (environment.entryFromLogin) {
      void this.router.navigateByUrl('/acceso', { replaceUrl: true });
    }
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => lucide.createIcons(), 50);
    }
  }

  onOpenNotification(): void {
    this.router.navigate(['/acceso']);
  }
}
