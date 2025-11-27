import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import { Carrera } from '../../interfaces/estructura-academica.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  rut = '';
  nombre = '';
  email = '';
  password = '';
  carreraId = 0;
  mensaje = '';
  currentYear: number;

  carreras = signal<Carrera[]>([]);
  cargandoCarreras = signal(false);
  
  // Detecta si el email es de un estudiante
  isEstudiante = computed(() => {
    return this.email.endsWith('@alumnos.ubiobio.cl');
  });

  constructor(private apiService: ApiService, private router: Router) {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.cargarCarreras();
  }

  cargarCarreras(): void {
    this.cargandoCarreras.set(true);
    this.apiService.getCarreras(true).subscribe({
      next: (res: any) => {
        if (res.success && res.carreras) {
          this.carreras.set(res.carreras);
        }
        this.cargandoCarreras.set(false);
      },
      error: (err) => {
        console.error('Error al cargar carreras:', err);
        this.cargandoCarreras.set(false);
      }
    });
  }

 register() {
  if (!this.rut || !this.nombre || !this.email || !this.password) {
    this.mensaje = 'Por favor completa todos los campos';
    return;
  }

  if (!this.email.endsWith('@alumnos.ubiobio.cl') && !this.email.endsWith('@ubiobio.cl')) {
    this.mensaje = 'El correo debe ser institucional (@alumnos.ubiobio.cl o @ubiobio.cl)';
    return;
  }

  // Validar que estudiantes seleccionen una carrera
  if (this.isEstudiante() && (!this.carreraId || this.carreraId === 0)) {
    this.mensaje = 'Por favor selecciona tu carrera';
    return;
  }

  const payload = {
    rut: this.rut,
    nombre: this.nombre,
    email: this.email,
    password: this.password,
  };

  console.log('Payload enviado al backend:', payload);

  this.apiService.register(payload).subscribe({
    next: (res: any) => {
      console.log('Registro exitoso:', res);
      
      // Si es estudiante, asignar a la carrera seleccionada
      if (this.isEstudiante() && this.carreraId) {
        const estudianteData = {
          estudiante_rut: this.rut,
          ano_ingreso: new Date().getFullYear(),
          semestre_actual: 1,
          estado_estudiante: 'regular',
          creditos_aprobados: 0,
          es_carrera_principal: true
        };

        this.apiService.asignarEstudianteCarrera(this.carreraId, estudianteData).subscribe({
          next: () => {
            console.log('Estudiante asignado a carrera exitosamente');
            this.mensaje = 'Registro exitoso! Has sido asignado a tu carrera.';
            this.limpiarFormulario();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (err) => {
            console.error('Error al asignar estudiante a carrera:', err);
            this.mensaje = 'Registro exitoso, pero hubo un error al asignar la carrera. Contacta al administrador.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          }
        });
      } else {
        // No es estudiante, solo mostrar éxito
        this.mensaje = 'Registro exitoso!';
        this.limpiarFormulario();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    },
    error: (err: any) => {
      console.error('Error en registro:', err);
      this.mensaje = err.error?.message || 'Error al registrarse';
    }
  });
}

  limpiarFormulario(): void {
    this.rut = '';
    this.nombre = '';
    this.email = '';
    this.password = '';
    this.carreraId = 0;
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }
}
