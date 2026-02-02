/**
 * Módulo independiente para integración en app Angular principal
 * 
 * Para usar este módulo en otra aplicación Angular:
 * 
 * 1. Importar este módulo en el módulo principal:
 *    import { TuPotencialFinancieroModule } from './path/to/tu-potencial-financiero.module';
 * 
 * 2. Agregar a imports:
 *    imports: [TuPotencialFinancieroModule]
 * 
 * 3. Usar el componente:
 *    <app-wizard></app-wizard>
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { WizardComponent } from './components/wizard/wizard.component';
import { LandingComponent } from './components/landing/landing.component';
import { PerfilFinancieroComponent } from './components/perfil-financiero/perfil-financiero.component';
import { CapacidadFinanciacionComponent } from './components/capacidad-financiacion/capacidad-financiacion.component';
import { RecomendacionesProductosComponent } from './components/recomendaciones-productos/recomendaciones-productos.component';
import { EstablecerMetaComponent } from './components/establecer-meta/establecer-meta.component';
import { ResumenComponent } from './components/resumen/resumen.component';

@NgModule({
  declarations: [
    WizardComponent,
    LandingComponent,
    PerfilFinancieroComponent,
    CapacidadFinanciacionComponent,
    RecomendacionesProductosComponent,
    EstablecerMetaComponent,
    ResumenComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    WizardComponent
  ],
  providers: []
})
export class TuPotencialFinancieroModule { }
