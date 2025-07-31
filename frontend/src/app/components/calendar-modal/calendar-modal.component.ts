import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  ngOnInit() {
    console.log('CalendarModal ngOnInit - Propuestas recibidas:', this.propuestas);
    this.generateEvents();
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['propuestas'] && !changes['propuestas'].firstChange) {
      this.generateEvents();
      this.generateCalendar();
    }
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
    console.log('Generando eventos con propuestas:', this.propuestas);
    
    if (this.propuestas.length > 0) {
      // Generar eventos basados en las propuestas
      this.propuestas.forEach(propuesta => {
        console.log('Procesando propuesta:', propuesta);
        const fechaEnvio = new Date(propuesta.fecha_envio);
        console.log('Fecha de envío parseada:', fechaEnvio);
        
        // Evento de envío de propuesta
        this.upcomingEvents.push({
          titulo: `Envío: ${propuesta.titulo}`,
          fecha: fechaEnvio,
          icono: 'fas fa-paper-plane',
          descripcion: 'Propuesta enviada para revisión',
          tipo: 'envio'
        });
        
        // Si la propuesta tiene profesor asignado, agregar eventos del profesor
        if (propuesta.profesor_rut) {
          // Revisión del profesor (7 días después del envío)
          const revisionProfesor = new Date(fechaEnvio.getTime() + (7 * 24 * 60 * 60 * 1000));
          this.upcomingEvents.push({
            titulo: `Revisión Profesor: ${propuesta.nombre_profesor || 'Profesor'}`,
            fecha: revisionProfesor,
            icono: 'fas fa-user-tie',
            descripcion: 'Revisión y comentarios del profesor',
            tipo: 'revision'
          });
          
          // Entrega de correcciones (si el estado es correcciones)
          if (propuesta.estado === 'correcciones') {
            const correcciones = new Date(fechaEnvio.getTime() + (14 * 24 * 60 * 60 * 1000));
            this.upcomingEvents.push({
              titulo: 'Entrega de Correcciones',
              fecha: correcciones,
              icono: 'fas fa-edit',
              descripcion: 'Fecha límite para entregar correcciones',
              tipo: 'correcciones'
            });
          }
        }
        
        // Evento de entrega final (30 días después)
        const entregaFinal = new Date(fechaEnvio.getTime() + (30 * 24 * 60 * 60 * 1000));
        this.upcomingEvents.push({
          titulo: 'Entrega Final',
          fecha: entregaFinal,
          icono: 'fas fa-clock',
          descripcion: 'Fecha límite para entrega final',
          tipo: 'entrega'
        });
        
        // Evento de defensa (45 días después)
        const defensa = new Date(fechaEnvio.getTime() + (45 * 24 * 60 * 60 * 1000));
        this.upcomingEvents.push({
          titulo: 'Defensa',
          fecha: defensa,
          icono: 'fas fa-gavel',
          descripcion: 'Presentación y defensa del proyecto',
          tipo: 'defensa'
        });
      });
    } else {
      // Eventos por defecto del año académico
      const hoy = new Date();
      this.upcomingEvents = [
        {
          titulo: 'Inicio Semestre',
          fecha: new Date(hoy.getFullYear(), 2, 1), // 1 de marzo
          icono: 'fas fa-play',
          descripcion: 'Inicio del semestre académico',
          tipo: 'academico'
        },
        {
          titulo: 'Entrega Final',
          fecha: new Date(hoy.getFullYear(), 11, 15), // 15 de diciembre
          icono: 'fas fa-clock',
          descripcion: 'Fecha límite para entrega final',
          tipo: 'entrega'
        },
        {
          titulo: 'Defensa',
          fecha: new Date(hoy.getFullYear(), 11, 20), // 20 de diciembre
          icono: 'fas fa-gavel',
          descripcion: 'Presentación y defensa del proyecto',
          tipo: 'defensa'
        }
      ];
      
      // Agregar eventos de prueba para el mes actual
      const eventoPrueba = new Date();
      eventoPrueba.setDate(eventoPrueba.getDate() + 5); // 5 días desde hoy
      this.upcomingEvents.push({
        titulo: 'Evento de Prueba',
        fecha: eventoPrueba,
        icono: 'fas fa-star',
        descripcion: 'Evento de prueba para verificar funcionamiento',
        tipo: 'academico'
      });
    }
    
    // Ordenar por fecha
    this.upcomingEvents.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    console.log('Eventos generados:', this.upcomingEvents);
  }

  hasEventOnDate(date: Date): boolean {
    const hasEvent = this.upcomingEvents.some(event => 
      this.isSameDay(event.fecha, date)
    );
    if (hasEvent) {
      console.log('Evento encontrado para fecha:', date, 'Eventos:', this.upcomingEvents.filter(event => this.isSameDay(event.fecha, date)));
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

  getDiasConEventos(): number {
    return this.calendarDays.filter(d => d.hasEvent).length;
  }
} 