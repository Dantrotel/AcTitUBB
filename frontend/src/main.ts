import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (environment.production) {
  window.console.log = () => {};
  window.console.warn = () => {};
  window.console.debug = () => {};
  // console.error se mantiene activo para monitoreo de errores reales
}

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));
