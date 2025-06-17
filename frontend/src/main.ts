import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app'; // asegúrate que el archivo se llame así
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient() // para usar HttpClient en servicios
  ],
}).catch(err => console.error(err));
