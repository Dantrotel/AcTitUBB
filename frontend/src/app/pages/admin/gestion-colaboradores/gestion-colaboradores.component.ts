import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ColaboradoresExternosService, ColaboradorExterno, EntidadExterna } from '../../../services/colaboradores-externos.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gestion-colaboradores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule
  ],
  templateUrl: './gestion-colaboradores.component.html',
  styleUrls: ['./gestion-colaboradores.component.scss']
})
export class GestionColaboradoresComponent implements OnInit {
  private colaboradoresService = inject(ColaboradoresExternosService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private http = inject(HttpClient);

  colaboradores = signal<ColaboradorExterno[]>([]);
  entidades = signal<EntidadExterna[]>([]);
  cargando = signal(false);
  mostrarFormulario = signal(false);
  busqueda = '';
  
  nuevoColaborador: ColaboradorExterno = this.getColaboradorVacio();

  tiposColaborador = [
    { value: 'supervisor_empresa', label: 'Supervisor de Empresa' },
    { value: 'asesor_tecnico', label: 'Asesor Técnico' },
    { value: 'evaluador_externo', label: 'Evaluador Externo' },
    { value: 'otro', label: 'Otro' }
  ];

  ngOnInit() {
    this.cargarEntidades();
    this.cargarColaboradores();
  }

  cargarEntidades() {
    this.colaboradoresService.obtenerEntidades(true).subscribe({
      next: (response) => {
        this.entidades.set(response.entidades);
      },
      error: (error) => {
        console.error('Error al cargar entidades:', error);
      }
    });
  }

  cargarColaboradores() {
    this.cargando.set(true);
    const filtros = this.busqueda ? { busqueda: this.busqueda } : {};
    
    this.colaboradoresService.obtenerColaboradores(filtros).subscribe({
      next: (response) => {
        this.colaboradores.set(response.colaboradores);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar colaboradores:', error);
        this.snackBar.open('Error al cargar colaboradores', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  buscar() {
    this.cargarColaboradores();
  }

  toggleFormulario() {
    this.mostrarFormulario.set(!this.mostrarFormulario());
    if (!this.mostrarFormulario()) {
      this.nuevoColaborador = this.getColaboradorVacio();
    }
  }

  crearColaborador() {
    if (!this.nuevoColaborador.nombre_completo || !this.nuevoColaborador.email || !this.nuevoColaborador.entidad_id) {
      this.snackBar.open('Complete los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.nuevoColaborador.email)) {
      this.snackBar.open('Email inválido', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando.set(true);
    this.colaboradoresService.crearColaborador(this.nuevoColaborador).subscribe({
      next: (response) => {
        this.snackBar.open('Colaborador creado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarColaboradores();
        this.toggleFormulario();
      },
      error: (error) => {
        console.error('Error al crear colaborador:', error);
        const mensaje = error.error?.error || 'Error al crear colaborador';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 5000 });
        this.cargando.set(false);
      }
    });
  }

  verificarColaborador(colaborador: ColaboradorExterno) {
    if (!colaborador.id) return;

    this.cargando.set(true);
    this.colaboradoresService.verificarColaborador(colaborador.id).subscribe({
      next: (response) => {
        this.snackBar.open('Colaborador verificado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarColaboradores();
      },
      error: (error) => {
        console.error('Error al verificar colaborador:', error);
        this.snackBar.open('Error al verificar colaborador', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  getColaboradorVacio(): ColaboradorExterno {
    return {
      nombre_completo: '',
      email: '',
      entidad_id: 0,
      tipo_colaborador: 'supervisor_empresa',
      telefono: '',
      rut: '',
      cargo: '',
      area_departamento: '',
      especialidad: '',
      anos_experiencia: undefined,
      linkedin: '',
      biografia: '',
      observaciones: ''
    };
  }

  getTipoLabel(tipo: string): string {
    return this.tiposColaborador.find(t => t.value === tipo)?.label || tipo;
  }

  verProyectos(colaborador: ColaboradorExterno): void {
    // Obtener proyectos asignados al colaborador
    this.cargando.set(true);
    
    this.http.get<any>(
      `${environment.apiUrl}/colaboradores-externos/proyectos-colaborador/${colaborador.id}`
    ).subscribe({
      next: (response) => {
        this.cargando.set(false);
        
        if (!response.proyectos || response.proyectos.length === 0) {
          this.snackBar.open(
            `${colaborador.nombre_completo} no tiene proyectos asignados`,
            'Cerrar',
            { duration: 4000 }
          );
          return;
        }

        // Mostrar modal con los proyectos
        const proyectosHTML = response.proyectos.map((p: any) => `
          <div style="border-left: 4px solid #2196F3; padding: 12px; margin: 8px 0; background: #f5f5f5;">
            <h4 style="margin: 0 0 8px 0; color: #1976D2;">${p.proyecto_titulo || 'Proyecto'}</h4>
            <p style="margin: 4px 0;"><strong>Rol:</strong> ${p.rol_en_proyecto || 'No especificado'}</p>
            ${p.descripcion_rol ? `<p style="margin: 4px 0;"><strong>Descripción:</strong> ${p.descripcion_rol}</p>` : ''}
            <p style="margin: 4px 0;"><strong>Fecha inicio:</strong> ${p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-CL') : 'N/A'}</p>
            ${p.horas_dedicadas ? `<p style="margin: 4px 0;"><strong>Horas dedicadas:</strong> ${p.horas_dedicadas}h (${p.frecuencia_interaccion || 'N/A'})</p>` : ''}
            <p style="margin: 4px 0;"><strong>Estado:</strong> ${p.activo ? '🟢 Activo' : '🔴 Inactivo'}</p>
          </div>
        `).join('');

        // Mostrar detalles en formato texto
        const proyectosTexto = response.proyectos.map((p: any, index: number) => `
${index + 1}. ${p.proyecto_titulo || 'Proyecto'}
   - Rol: ${p.rol_en_proyecto || 'No especificado'}
   ${p.descripcion_rol ? '- Descripción: ' + p.descripcion_rol : ''}
   - Fecha inicio: ${p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString('es-CL') : 'N/A'}
   ${p.horas_dedicadas ? '- Horas dedicadas: ' + p.horas_dedicadas + 'h (' + (p.frecuencia_interaccion || 'N/A') + ')' : ''}
   - Estado: ${p.activo ? '🟢 Activo' : '🔴 Inactivo'}
        `).join('\n');

        const detalles = `📁 PROYECTOS DE ${colaborador.nombre_completo.toUpperCase()}
        
Total de proyectos: ${response.proyectos.length}

${proyectosTexto}`;

        this.snackBar.open(
          `${colaborador.nombre_completo} participa en ${response.proyectos.length} proyecto(s).`,
          'Cerrar',
          { duration: 5000 }
        );
      },
      error: (error) => {
        this.cargando.set(false);
        console.error('Error al cargar proyectos:', error);
        this.snackBar.open(
          'Error al cargar los proyectos del colaborador',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  verDetalles(colaborador: ColaboradorExterno): void {
    // Mostrar modal con toda la información del colaborador
    const detalles = `
      📋 INFORMACIÓN COMPLETA
      
      👤 Nombre: ${colaborador.nombre_completo}
      📧 Email: ${colaborador.email}
      ${colaborador.rut ? '🆔 RUT: ' + colaborador.rut : ''}
      ${colaborador.telefono ? '📱 Teléfono: ' + colaborador.telefono : ''}
      
      🏢 INFORMACIÓN LABORAL
      Entidad: ${colaborador.entidad_nombre || 'N/A'}
      ${colaborador.cargo ? 'Cargo: ' + colaborador.cargo : ''}
      ${colaborador.area_departamento ? 'Área: ' + colaborador.area_departamento : ''}
      Tipo: ${this.getTipoLabel(colaborador.tipo_colaborador)}
      
      💼 EXPERIENCIA
      ${colaborador.especialidad ? 'Especialidad: ' + colaborador.especialidad : ''}
      ${colaborador.anos_experiencia ? 'Años de experiencia: ' + colaborador.anos_experiencia : ''}
      ${colaborador.linkedin ? 'LinkedIn: ' + colaborador.linkedin : ''}
      
      📝 DESCRIPCIÓN
      ${colaborador.biografia || 'Sin biografía'}
      
      ℹ️ ESTADO
      ${colaborador.verificado ? '✅ Verificado' : '⏳ Pendiente de verificación'}
      ${colaborador.activo ? '🟢 Activo' : '🔴 Inactivo'}
    `;

    this.snackBar.open(
      `${colaborador.nombre_completo} — ${colaborador.entidad_nombre || 'Sin entidad asignada'} | ${this.getTipoLabel(colaborador.tipo_colaborador)}`,
      'Cerrar',
      { duration: 5000 }
    );
  }

  editarColaborador(colaborador: ColaboradorExterno): void {
    // Cargar datos del colaborador en el formulario para editar
    this.nuevoColaborador = { ...colaborador };
    this.mostrarFormulario.set(true);
    
    // Scroll al formulario
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
    this.snackBar.open(
      'Puedes editar la información del colaborador',
      'Cerrar',
      { duration: 3000 }
    );
  }

  volver(): void {
    window.history.back();
  }
}
