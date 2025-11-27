import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-revisar-propuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revisar-propuesta.html',
  styleUrls: ['./revisar-propuesta.scss']
})
export class RevisarPropuestaComponent implements OnInit {
  propuestaId!: string;
  propuesta: any = null;
  comentarios = '';
  estado = '';
  estados = ['pendiente', 'correcciones', 'aprobada', 'rechazada'];
  error = '';
  esProfesor = false;

  private notificationService = inject(NotificationService);

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.propuestaId = this.route.snapshot.paramMap.get('id') || '';
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      this.esProfesor = userData && userData.rol_id === 2;
    }
    if (!this.esProfesor) {
      this.error = 'Acceso denegado: solo profesores pueden revisar propuestas.';
      return;
    }

    this.api.getPropuestaById(this.propuestaId).subscribe({
      next: (data: any) => {
        this.propuesta = data;
        this.estado = data.estado;
        this.comentarios = data.comentarios_profesor || '';
      },
      error: () => this.error = 'No se pudo cargar la propuesta.'
    });
  }

  guardarRevision() {
    if (!this.comentarios || this.comentarios.trim().length === 0 || !this.estado) {
      this.notificationService.warning('Debes ingresar comentarios y seleccionar un estado.');
      return;
    }
    this.api.revisarPropuesta(this.propuestaId, {
      comentarios_profesor: this.comentarios.trim(),
      estado: this.estado
    }).subscribe({
      next: (response: any) => {
        if (this.estado === 'aprobada') {
          // Propuesta aprobada - mostrar mensaje sobre proyecto creado
          if (response.proyecto_creado && response.proyecto_id) {
            this.notificationService.success(
              `Se ha creado automáticamente el proyecto con ID: ${response.proyecto_id}. El proyecto está en estado "Esperando Asignación de Profesores". Los administradores deben asignar los 3 roles (Profesor Guía, Revisor e Informante) para activarlo.`,
              '✅ Propuesta Aprobada',
              8000
            );
          } else {
            this.notificationService.success('Se ha iniciado el proceso de creación automática del proyecto.', '✅ Propuesta Aprobada');
          }
        } else {
          this.notificationService.success('Revisión guardada correctamente');
        }
        this.router.navigate(['/profesor/propuestas/asignadas']);
      },
      error: () => this.notificationService.error('No se pudo guardar la revisión')
    });
  }
}
