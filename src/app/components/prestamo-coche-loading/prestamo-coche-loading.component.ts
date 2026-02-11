import { Component, Input, AfterViewInit } from '@angular/core';

declare var lucide: any;

@Component({
  selector: 'app-prestamo-coche-loading',
  templateUrl: './prestamo-coche-loading.component.html',
  styleUrls: ['./prestamo-coche-loading.component.scss']
})
export class PrestamoCocheLoadingComponent implements AfterViewInit {
  @Input() message: string = 'Preparando la documentación del préstamo';
  @Input() subtitle: string = '';
  @Input() items: string[] = [];

  ngAfterViewInit(): void {
    // Asegurar que la pantalla del flujo se muestre siempre desde arriba
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
      const wizard = document.querySelector('.wizard-content');
      if (wizard) {
        (wizard as HTMLElement).scrollTop = 0;
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 0);
  }
}
