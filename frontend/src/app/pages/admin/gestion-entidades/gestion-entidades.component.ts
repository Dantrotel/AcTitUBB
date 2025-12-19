import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColaboradoresExternosService, EntidadExterna } from '../../../services/colaboradores-externos.service';

@Component({
  selector: 'app-gestion-entidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './gestion-entidades.component.html',
  styleUrls: ['./gestion-entidades.component.scss']
})
export class GestionEntidadesComponent implements OnInit {
  private colaboradoresService = inject(ColaboradoresExternosService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  entidades = signal<EntidadExterna[]>([]);
  cargando = signal(false);
  mostrarFormulario = signal(false);
  
  displayedColumns = ['nombre', 'tipo', 'email_contacto', 'telefono', 'activo', 'acciones'];

  nuevaEntidad: EntidadExterna = {
    nombre: '',
    razon_social: '',
    rut_empresa: '',
    tipo: 'empresa_privada',
    email_contacto: '',
    telefono: '',
    direccion: '',
    sitio_web: '',
    descripcion: '',
    area_actividad: ''
  };

  tiposEntidad = [
    { value: 'empresa_privada', label: 'Empresa Privada' },
    { value: 'empresa_publica', label: 'Empresa Pública' },
    { value: 'institucion_educativa', label: 'Institución Educativa' },
    { value: 'ong', label: 'ONG' },
    { value: 'organismo_publico', label: 'Organismo Público' },
    { value: 'otra', label: 'Otra' }
  ];

  ngOnInit() {
    this.cargarEntidades();
  }

  cargarEntidades() {
    this.cargando.set(true);
    this.colaboradoresService.obtenerEntidades().subscribe({
      next: (response) => {
        this.entidades.set(response.entidades);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar entidades:', error);
        this.snackBar.open('Error al cargar entidades', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  toggleFormulario() {
    this.mostrarFormulario.set(!this.mostrarFormulario());
    if (!this.mostrarFormulario()) {
      this.resetearFormulario();
    }
  }

  crearEntidad() {
    if (!this.nuevaEntidad.nombre || !this.nuevaEntidad.tipo) {
      this.snackBar.open('Complete los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando.set(true);
    this.colaboradoresService.crearEntidad(this.nuevaEntidad).subscribe({
      next: (response) => {
        this.snackBar.open('Entidad creada exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarEntidades();
        this.toggleFormulario();
        this.resetearFormulario();
      },
      error: (error) => {
        console.error('Error al crear entidad:', error);
        this.snackBar.open('Error al crear entidad', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  resetearFormulario() {
    this.nuevaEntidad = {
      nombre: '',
      razon_social: '',
      rut_empresa: '',
      tipo: 'empresa_privada',
      email_contacto: '',
      telefono: '',
      direccion: '',
      sitio_web: '',
      descripcion: '',
      area_actividad: ''
    };
  }

  getTipoLabel(tipo: string): string {
    return this.tiposEntidad.find(t => t.value === tipo)?.label || tipo;
  }

  verColaboradores(entidad: EntidadExterna): void {
    // Navegar a la página de colaboradores con filtro de esta entidad
    this.router.navigate(['/admin/colaboradores-externos'], {
      queryParams: { entidad_id: entidad.id }
    });
    
    this.snackBar.open(
      `Mostrando colaboradores de ${entidad.nombre}`,
      'Cerrar',
      { duration: 3000 }
    );
  }

  verDetalles(entidad: EntidadExterna): void {
    // Mostrar modal con toda la información de la entidad
    const detalles = `
      📋 INFORMACIÓN COMPLETA
      
      🏢 ${entidad.nombre}
      ${entidad.razon_social && entidad.razon_social !== entidad.nombre ? '📄 Razón Social: ' + entidad.razon_social : ''}
      ${entidad.rut_empresa ? '🆔 RUT: ' + entidad.rut_empresa : ''}
      
      📂 TIPO
      ${this.getTipoLabel(entidad.tipo)}
      ${entidad.area_actividad ? '💼 Área: ' + entidad.area_actividad : ''}
      
      📞 CONTACTO
      ${entidad.email_contacto ? '📧 Email: ' + entidad.email_contacto : ''}
      ${entidad.telefono ? '📱 Teléfono: ' + entidad.telefono : ''}
      ${entidad.sitio_web ? '🌐 Web: ' + entidad.sitio_web : ''}
      ${entidad.direccion ? '📍 Dirección: ' + entidad.direccion : ''}
      
      📝 DESCRIPCIÓN
      ${entidad.descripcion || 'Sin descripción'}
      
      ℹ️ ESTADO
      ${entidad.activo ? '🟢 Activa' : '🔴 Inactiva'}
    `;

    alert(detalles);
    console.log('Detalles completos de la entidad:', entidad);
  }

  editarEntidad(entidad: EntidadExterna): void {
    // Cargar datos de la entidad en el formulario para editar
    this.nuevaEntidad = { ...entidad };
    this.mostrarFormulario.set(true);
    
    // Scroll al formulario
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
    this.snackBar.open(
      'Puedes editar la información de la entidad',
      'Cerrar',
      { duration: 3000 }
    );
  }

  volver(): void {
    window.history.back();
  }
}
