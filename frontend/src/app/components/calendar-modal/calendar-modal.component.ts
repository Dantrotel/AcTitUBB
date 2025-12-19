import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-calendar-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Calendario de Fechas</h2>
          <button class="close-btn" (click)="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="calendar-container">
          <div class="calendar-header">
            <button class="nav-btn" (click)="previousMonth()">
              <i class="fas fa-chevron-left"></i>
            </button>
            <h3>{{getMonthYear()}}</h3>
            <button class="nav-btn" (click)="nextMonth()">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <!-- Debug info -->
          <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 12px;">
            <strong>Debug:</strong> Propuestas: {{propuestas.length}} | Eventos: {{upcomingEvents.length}} | Días con eventos: {{getDiasConEventos()}}
          </div>
          
          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <div class="weekday" *ngFor="let day of weekdays">{{day}}</div>
            </div>
            
            <div class="calendar-days">
              <div 
                class="calendar-day" 
                *ngFor="let day of calendarDays"
                [class.other-month]="!day.isCurrentMonth"
                [class.today]="day.isToday"
                [class.has-event]="day.hasEvent"
                (click)="selectDate(day)"
              >
                <span class="day-number">{{day.dayNumber}}</span>
                <div class="event-indicator" *ngIf="day.hasEvent">
                  <i class="fas fa-circle"></i>
                </div>
              </div>
            </div>
          </div>
          
                     <div class="events-list" *ngIf="selectedDateEvents.length > 0">
             <h4>Eventos del {{selectedDate | date:'dd MMM yyyy'}}</h4>
             <div class="event-item" 
                  *ngFor="let event of selectedDateEvents"
                  [class]="'tipo-' + event.tipo">
               <div class="event-icon">
                 <i [class]="event.icono"></i>
               </div>
               <div class="event-details">
                 <div class="event-title">{{event.titulo}}</div>
                 <div class="event-description">{{event.descripcion}}</div>
               </div>
             </div>
           </div>
          
                     <div class="upcoming-events">
             <h4>Próximos Eventos</h4>
             <div class="event-item" 
                  *ngFor="let event of upcomingEvents"
                  [class]="'tipo-' + event.tipo">
               <div class="event-icon">
                 <i [class]="event.icono"></i>
               </div>
               <div class="event-details">
                 <div class="event-title">{{event.titulo}}</div>
                 <div class="event-date">{{event.fecha | date:'dd MMM yyyy'}}</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./calendar-modal.component.scss']
})
export class CalendarModalComponent implements OnInit, OnChanges {
  @Input() propuestas: any[] = [];
  @Output() close = new EventEmitter<void>();

  currentDate = new Date();
  selectedDate: Date | null = null;
  weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: any[] = [];
  selectedDateEvents: any[] = [];
  upcomingEvents: any[] = [];
  fechasCalendario: any[] = []; // Fechas del backend
  loading = false;

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    this.cargarFechasCalendario();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['propuestas'] && !changes['propuestas'].firstChange) {
      this.cargarFechasCalendario();
    }
  }

  cargarFechasCalendario() {
    this.loading = true;
    this.apiService.getMisFechasCalendario().subscribe({
      next: (response: any) => {
        this.fechasCalendario = response;
        this.generateEvents();
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        // Fallback a la funcionalidad anterior si hay error
        this.generateEvents();
        this.generateCalendar();
        this.loading = false;
      }
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayNumber = currentDate.getDate();
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = this.isSameDay(currentDate, today);
      const hasEvent = this.hasEventOnDate(currentDate);
      
      this.calendarDays.push({
        date: currentDate,
        dayNumber,
        isCurrentMonth,
        isToday,
        hasEvent
      });
    }
  }

  generateEvents() {
    this.upcomingEvents = [];
    
    // SOLO agregar fechas reales del backend (NO generar fechas dummy)
    if (this.fechasCalendario && this.fechasCalendario.length > 0) {
      this.fechasCalendario.forEach(fecha => {
        // Parsear fecha sin conversión de timezone
        const [year, month, day] = fecha.fecha.split('-').map(Number);
        const fechaDate = new Date(year, month - 1, day);
        
        this.upcomingEvents.push({
          titulo: fecha.titulo,
          fecha: fechaDate,
          icono: this.getIconoTipoFecha(fecha.tipo_fecha),
          descripcion: fecha.descripcion || `Fecha ${fecha.es_global ? 'global' : 'específica'} - ${fecha.tipo_creador}`,
          tipo: fecha.tipo_fecha,
          esDelBackend: true,
          creador: fecha.tipo_creador || (fecha.es_global ? 'Admin' : 'Profesor')
        });
      });
    } else {
    }
    
    
    // Ordenar por fecha
    this.upcomingEvents.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }

  hasEventOnDate(date: Date): boolean {
    const hasEvent = this.upcomingEvents.some(event => 
      this.isSameDay(event.fecha, date)
    );
    if (hasEvent) {
    }
    return hasEvent;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  selectDate(day: any) {
    this.selectedDate = day.date;
    this.selectedDateEvents = this.upcomingEvents.filter(event => 
      this.isSameDay(event.fecha, day.date)
    );
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthYear(): string {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      year: 'numeric' 
    };
    return this.currentDate.toLocaleDateString('es-ES', options);
  }

  closeModal() {
    this.close.emit();
  }

  getIconoTipoFecha(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'global': 'fas fa-globe',
      'academica': 'fas fa-graduation-cap',
      'entrega': 'fas fa-clock',
      'revision': 'fas fa-search',
      'defensa': 'fas fa-gavel',
      'reunion': 'fas fa-users',
      'otro': 'fas fa-calendar-day'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  getDiasConEventos(): number {
    return this.calendarDays.filter(d => d.hasEvent).length;
  }
} 