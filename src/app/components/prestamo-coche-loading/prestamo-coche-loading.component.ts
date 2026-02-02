import { Component, Input, AfterViewInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-loading',
  templateUrl: './prestamo-coche-loading.component.html',
  styleUrls: ['./prestamo-coche-loading.component.scss']
})
export class PrestamoCocheLoadingComponent implements AfterViewInit {
  @Input() message: string = 'Preparando la documentación del préstamo';

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      setTimeout(() => {
        lucide.createIcons();
      }, 100);
    }
  }
}
