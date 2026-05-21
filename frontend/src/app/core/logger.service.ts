import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(...args: any[]) {
    if (!environment.production) console.log(...args);
  }
  warn(...args: any[]) {
    if (!environment.production) console.warn(...args);
  }
  error(...args: any[]) {
    console.error(...args);
  }
}