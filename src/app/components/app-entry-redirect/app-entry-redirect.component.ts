import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

/** Redirige la raíz y rutas desconocidas según V1 (notificación) o V2 (login). */
@Component({
  selector: 'app-entry-redirect',
  template: ''
})
export class AppEntryRedirectComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    const target = environment.entryFromLogin ? '/acceso' : '/notificacion';
    void this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
