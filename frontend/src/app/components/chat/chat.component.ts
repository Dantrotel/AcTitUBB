import { Component, OnInit, OnDestroy, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Conversacion, Mensaje, Usuario } from '../../services/chat.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatBadgeModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('mensajesContainer') private mensajesContainer!: ElementRef;
  
  chatService = signal(new ChatService());
  
  // Estado local
  conversacionSeleccionada = signal<Conversacion | null>(null);
  nuevoMensaje = signal<string>('');
  busqueda = signal<string>('');
  usuariosBuscados = signal<Usuario[]>([]);
  cargando = signal<boolean>(false);
  mostrarBusqueda = signal<boolean>(false);
  
  private escribiendoTimeout: any;
  rutUsuarioActual: string = '';

  constructor(private chatSrv: ChatService) {
    // Obtener RUT del usuario actual desde el token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.rutUsuarioActual = payload.rut;
      } catch (e) {
      }
    }

    // Efecto para scroll automático cuando cambian los mensajes
    effect(() => {
      const mensajes = this.chatSrv.mensajesActuales();
      if (mensajes.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnInit() {
    this.inicializarChat();
  }

  ngOnDestroy() {
    // Salir de la conversación actual si existe
    const conversacionActiva = this.chatSrv.conversacionActiva();
    if (conversacionActiva) {
      this.chatSrv.salirDeConversacion(conversacionActiva);
    }
    
    // Desconectar socket
    this.chatSrv.desconectarSocket();
  }

  async inicializarChat() {
    this.cargando.set(true);
    
    try {
      // Conectar WebSocket
      const token = localStorage.getItem('token');
      if (token) {
        this.chatSrv.conectarSocket(token);
      }
      
      // Cargar conversaciones
      await this.chatSrv.obtenerConversaciones();
      
      // Obtener total de mensajes no leídos
      await this.chatSrv.obtenerTotalNoLeidos();
      
    } catch (error) {
    } finally {
      this.cargando.set(false);
    }
  }

  async seleccionarConversacion(conversacion: Conversacion) {
    try {
      // Salir de la conversación anterior
      const conversacionAnterior = this.chatSrv.conversacionActiva();
      if (conversacionAnterior) {
        this.chatSrv.salirDeConversacion(conversacionAnterior);
      }
      
      // Seleccionar nueva conversación
      this.conversacionSeleccionada.set(conversacion);
      
      // Unirse a la sala de WebSocket
      this.chatSrv.unirseAConversacion(conversacion.id);
      
      // Cargar mensajes
      await this.chatSrv.obtenerMensajes(conversacion.id);
      
      // Marcar como leídos
      if (conversacion.mensajes_no_leidos > 0) {
        await this.chatSrv.marcarComoLeidos(conversacion.id);
        this.chatSrv.marcarLeidosSocket(conversacion.id);
      }
      
      this.scrollToBottom();
      
    } catch (error) {
    }
  }

  async enviarMensaje() {
    const contenido = this.nuevoMensaje().trim();
    const conversacion = this.conversacionSeleccionada();
    
    if (!contenido || !conversacion) return;
    
    try {
      // Enviar por WebSocket para mayor rapidez
      this.chatSrv.enviarMensajeSocket(conversacion.id, contenido);
      
      // Limpiar input
      this.nuevoMensaje.set('');
      
      // Detener indicador de escritura
      this.chatSrv.notificarEscribiendo(conversacion.id, false);
      
    } catch (error) {
    }
  }

  onEnterPress(event: KeyboardEvent) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  onInputChange() {
    const conversacion = this.conversacionSeleccionada();
    if (!conversacion) return;
    
    // Notificar que está escribiendo
    this.chatSrv.notificarEscribiendo(conversacion.id, true);
    
    // Resetear timeout
    if (this.escribiendoTimeout) {
      clearTimeout(this.escribiendoTimeout);
    }
    
    // Después de 2 segundos sin escribir, notificar que dejó de escribir
    this.escribiendoTimeout = setTimeout(() => {
      this.chatSrv.notificarEscribiendo(conversacion.id, false);
    }, 2000);
  }

  async buscarUsuarios() {
    const termino = this.busqueda().trim();
    
    if (termino.length < 2) {
      this.usuariosBuscados.set([]);
      return;
    }
    
    try {
      const usuarios = await this.chatSrv.buscarUsuarios(termino);
      this.usuariosBuscados.set(usuarios);
    } catch (error) {
    }
  }

  async iniciarConversacionCon(usuario: Usuario) {
    try {
      const conversacion = await this.chatSrv.obtenerOCrearConversacion(usuario.rut);
      
      // Actualizar lista de conversaciones
      await this.chatSrv.obtenerConversaciones();
      
      // Seleccionar la conversación
      const conversacionCompleta = this.chatSrv.conversaciones().find(c => c.id === conversacion.id);
      if (conversacionCompleta) {
        await this.seleccionarConversacion(conversacionCompleta);
      }
      
      // Cerrar búsqueda
      this.mostrarBusqueda.set(false);
      this.busqueda.set('');
      this.usuariosBuscados.set([]);
      
    } catch (error) {
    }
  }

  toggleBusqueda() {
    this.mostrarBusqueda.update(v => !v);
    if (!this.mostrarBusqueda()) {
      this.busqueda.set('');
      this.usuariosBuscados.set([]);
    }
  }

  esMiMensaje(mensaje: Mensaje): boolean {
    return mensaje.remitente_rut === this.rutUsuarioActual;
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    const esHoy = date.toDateString() === hoy.toDateString();
    const esAyer = date.toDateString() === ayer.toDateString();
    
    const hora = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    
    if (esHoy) return hora;
    if (esAyer) return `Ayer ${hora}`;
    
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }) + ' ' + hora;
  }

  private scrollToBottom() {
    try {
      if (this.mensajesContainer) {
        this.mensajesContainer.nativeElement.scrollTop = 
          this.mensajesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
    }
  }

  // Getters para usar en el template
  get conversaciones() {
    return this.chatSrv.conversaciones();
  }

  get mensajes() {
    return this.chatSrv.mensajesActuales();
  }

  get totalNoLeidos() {
    return this.chatSrv.totalNoLeidos();
  }

  get conectado() {
    return this.chatSrv.conectado();
  }

  get usuarioEscribiendo() {
    return this.chatSrv.usuarioEscribiendo();
  }
}
