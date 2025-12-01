import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import { Carrera } from '../../interfaces/estructura-academica.interface';

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
}

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
  email = signal('');
  password = '';
  carreraId = 0;
  departamentoId = 0;
  mensaje = '';
  currentYear: number;

  carreras = signal<Carrera[]>([]);
  departamentos = signal<Departamento[]>([]);
  cargandoCarreras = signal(false);
  cargandoDepartamentos = signal(false);
  
  // Detecta si el email es de un estudiante
  isEstudiante = computed(() => {
    return this.email().endsWith('@alumnos.ubiobio.cl');
  });

  // Detecta si el email es de un profesor
  isProfesor = computed(() => {
    return this.email().endsWith('@ubiobio.cl') && !this.isEstudiante();
  });

  constructor(private apiService: ApiService, private router: Router) {
    this.currentYear = new Date().getFullYear();
    
    // Efecto para cargar departamentos cuando se detecte que es profesor
    effect(() => {
      if (this.isProfesor() && this.departamentos().length === 0 && !this.cargandoDepartamentos()) {
        this.cargarDepartamentos();
      }
    });
  }

  ngOnInit(): void {
    this.cargarCarreras();
  }

  cargarCarreras(): void {
    this.cargandoCarreras.set(true);
    this.apiService.getCarrerasPublicas().subscribe({
      next: (res: any) => {
        if (res.success && res.carreras) {
          this.carreras.set(res.carreras);
        } else if (Array.isArray(res)) {
          this.carreras.set(res);
        }
        this.cargandoCarreras.set(false);
      },
      error: (err) => {
        console.error('Error al cargar carreras:', err);
        this.cargandoCarreras.set(false);
      }
    });
  }

  cargarDepartamentos(): void {
    if (this.cargandoDepartamentos()) {
      return; // Ya se está cargando
    }
    this.cargandoDepartamentos.set(true);
    this.apiService.getDepartamentosPublicos().subscribe({
      next: (res: any) => {
        if (res.success && res.departamentos) {
          this.departamentos.set(res.departamentos);
        } else if (Array.isArray(res)) {
          this.departamentos.set(res);
        } else if (res.departamentos && Array.isArray(res.departamentos)) {
          this.departamentos.set(res.departamentos);
        }
        this.cargandoDepartamentos.set(false);
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.cargandoDepartamentos.set(false);
      }
    });
  }

  onEmailChange(): void {
    // Resetear selecciones cuando cambia el email
    if (!this.isEstudiante()) {
      this.carreraId = 0;
    }
    if (!this.isProfesor()) {
      this.departamentoId = 0;
    }
    
    // Cargar departamentos si es profesor y aún no se han cargado
    if (this.isProfesor() && this.departamentos().length === 0 && !this.cargandoDepartamentos()) {
      this.cargarDepartamentos();
    }
  }

 register() {
  const emailValue = this.email();
  if (!this.rut || !this.nombre || !emailValue || !this.password) {
    this.mensaje = 'Por favor completa todos los campos';
    return;
  }

  if (!emailValue.endsWith('@alumnos.ubiobio.cl') && !emailValue.endsWith('@ubiobio.cl')) {
    this.mensaje = 'El correo debe ser institucional (@alumnos.ubiobio.cl o @ubiobio.cl)';
    return;
  }

  // Validar que estudiantes seleccionen una carrera
  if (this.isEstudiante() && (!this.carreraId || this.carreraId === 0)) {
    this.mensaje = 'Por favor selecciona tu carrera';
    return;
  }

  // Validar que profesores seleccionen un departamento
  if (this.isProfesor() && (!this.departamentoId || this.departamentoId === 0)) {
    this.mensaje = 'Por favor selecciona tu departamento';
    return;
  }

  const payload = {
    rut: this.rut,
    nombre: this.nombre,
    email: emailValue,
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
      } else if (this.isProfesor() && this.departamentoId) {
        // Si es profesor, asignar al departamento seleccionado
        const profesorData = {
          profesor_rut: this.rut,
          es_principal: true
        };

        this.apiService.asignarProfesorDepartamento(this.departamentoId, profesorData).subscribe({
          next: () => {
            console.log('Profesor asignado a departamento exitosamente');
            this.mensaje = 'Registro exitoso! Has sido asignado a tu departamento.';
            this.limpiarFormulario();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (err) => {
            console.error('Error al asignar profesor a departamento:', err);
            this.mensaje = 'Registro exitoso, pero hubo un error al asignar el departamento. Contacta al administrador.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          }
        });
      } else {
        // No es estudiante ni profesor, solo mostrar éxito
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
    this.email.set('');
    this.password = '';
    this.carreraId = 0;
    this.departamentoId = 0;
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }
}
