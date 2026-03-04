import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-calendario-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario-estudiante.component.html',
  styleUrls: ['./calendario-estudiante.component.scss']
})
export class CalendarioEstudianteComponent implements OnInit {

  loading = false;
  error = '';

  // Datos del calendario
  fechas: any[] = [];
  fechasFiltradas: any[] = [];

  // Control de vista de calendario
  currentDate = new Date();
  weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  selectedDateEvents: any[] = [];

  // Tab activa: 'calendario' o 'lista'
  vistaActiva: 'calendario' | 'lista' = 'calendario';

  // Filtro por tipo
  filtroTipo = '';
  tiposFecha = [
    { value: '', label: 'Todos los tipos' },
    { value: 'global',       label: '🌐 Global' },
    { value: 'academica',    label: '🎓 Académica' },
    { value: 'entrega',      label: '📤 Entrega' },
    { value: 'revision',     label: '🔍 Revisión' },
    { value: 'defensa',      label: '🎤 Defensa' },
    { value: 'reunion',      label: '👥 Reunión' },
    { value: 'otro',         label: '📅 Otro' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarFechas();
  }

  cargarFechas(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getMisFechasCalendario().subscribe({
      next: (response: any) => {
        // El endpoint devuelve un array o un objeto con un array
        const rawFechas = Array.isArray(response) ? response : (response?.fechas || response?.data || []);

        // Solo fechas publicadas/habilitadas (filtramos por si el backend devuelve borradores)
        this.fechas = rawFechas.filter((f: any) =>
          f.habilitada !== false && f.activo !== false && f.publicado !== false
        );

        this.aplicarFiltro();
        this.generateCalendar();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar fechas del calendario:', err);
        this.error = 'No se pudieron cargar las fechas. Intenta nuevamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.filtroTipo) {
      this.fechasFiltradas = [...this.fechas];
    } else {
      this.fechasFiltradas = this.fechas.filter((f: any) => f.tipo_fecha === this.filtroTipo);
    }
    this.generateCalendar();
  }

  // ── Calendar methods ──────────────────────────────────────────────

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      this.calendarDays.push({
        date: d,
        dayNumber: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        isToday: this.isSameDay(d, today),
        events: this.getEventsOnDate(d)
      });
    }

    // Recalcular eventos del día seleccionado
    if (this.selectedDate) {
      this.selectedDateEvents = this.calendarDays.find(
        (day: any) => this.isSameDay(day.date, this.selectedDate!)
      )?.events ?? [];
    }
  }

  getEventsOnDate(date: Date): any[] {
    return this.fechasFiltradas.filter((f: any) => {
      const [y, m, d] = (f.fecha || f.fecha_fin || '').split('-').map(Number);
      if (!y) return false;
      const fechaEvento = new Date(y, m - 1, d);
      return this.isSameDay(fechaEvento, date);
    });
  }

  selectDate(day: any): void {
    this.selectedDate = day.date;
    this.selectedDateEvents = day.events;
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  getMonthYear(): string {
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getDate() === b.getDate() &&
           a.getMonth() === b.getMonth() &&
           a.getFullYear() === b.getFullYear();
  }

  // ── Aux ───────────────────────────────────────────────────────────

  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      global:     'fas fa-globe',
      academica:  'fas fa-graduation-cap',
      entrega:    'fas fa-upload',
      revision:   'fas fa-search',
      defensa:    'fas fa-gavel',
      reunion:    'fas fa-users',
      otro:       'fas fa-calendar-day'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  getLabelTipo(tipo: string): string {
    const t = this.tiposFecha.find(x => x.value === tipo);
    return t ? t.label : tipo;
  }

  getClaseBadgeTipo(tipo: string): string {
    const clases: { [key: string]: string } = {
      global:    'badge-global',
      academica: 'badge-academica',
      entrega:   'badge-entrega',
      revision:  'badge-revision',
      defensa:   'badge-defensa',
      reunion:   'badge-reunion',
      otro:      'badge-otro'
    };
    return clases[tipo] || 'badge-otro';
  }

  getFechasProximas(): any[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.fechasFiltradas
      .filter((f: any) => {
        const [y, m, d] = (f.fecha || f.fecha_fin || '').split('-').map(Number);
        if (!y) return false;
        return new Date(y, m - 1, d) >= hoy;
      })
      .sort((a: any, b: any) => {
        const [ay, am, ad] = (a.fecha || a.fecha_fin || '').split('-').map(Number);
        const [by, bm, bd] = (b.fecha || b.fecha_fin || '').split('-').map(Number);
        return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime();
      })
      .slice(0, 10);
  }

  parseFecha(fechaStr: string): Date | null {
    const parts = (fechaStr || '').split('-').map(Number);
    if (parts.length < 3 || !parts[0]) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  volver(): void {
    window.history.back();
  }
}
