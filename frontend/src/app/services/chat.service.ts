import { Injectable, inject, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';

export interface Conversacion {
  id: number;
  created_at: string;
  updated_at: string;
  otro_usuario_rut: string;
  otro_usuario_nombre: string;
  otro_usuario_email: string;
  ultimo_mensaje: string;
  ultimo_mensaje_fecha: string;
  ultimo_mensaje_remitente: string;
  mensajes_no_leidos: number;
}

export interface Mensaje {
  id: number;
  conversacion_id: number;
  remitente_rut: string;
  remitente_nombre: string;
  remitente_email: string;
  contenido: string;
  leido: boolean;
  fecha_lectura: string | null;
  created_at: string;
}

export interface Usuario {
  rut: string;
  nombre: string;
  email: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket | null = null;
  private apiUrl = 'http://localhost:3000/api/v1';
  // Signals para reactividad
  conversaciones = signal<Conversacion[]>([]);
  mensajesActuales = signal<Mensaje[]>([]);
  conversacionActiva = signal<number | null>(null);
  totalNoLeidos = signal<number>(0);
  usuarioEscribiendo = signal<boolean>(false);
  conectado = signal<boolean>(false);

  constructor() {}

  /**
   * Inicializar conexión WebSocket
   */
  conectarSocket(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.apiUrl.replace('/api/v1', ''), {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.conectado.set(true);
    });

    this.socket.on('disconnect', () => {
      this.conectado.set(false);
    });

    this.socket.on('connected', (data) => {
    });

    // Escuchar nuevos mensajes
    this.socket.on('chat:nuevo-mensaje', (data) => {
      this.handleNuevoMensaje(data);
    });

    // Escuchar notificaciones de mensajes
    this.socket.on('chat:notificacion-nuevo-mensaje', (data) => {
      this.handleNotificacionMensaje(data);
    });

    // Escuchar cuando alguien está escribiendo
    this.socket.on('chat:usuario-escribiendo', (data) => {
      if (data.conversacionId === this.conversacionActiva()) {
        this.usuarioEscribiendo.set(data.escribiendo);
      }
    });

    // Escuchar cuando se marcan mensajes como leídos
    this.socket.on('chat:mensajes-leidos', (data) => {
      this.handleMensajesLeidos(data);
    });

    this.socket.on('chat:error', (data) => {
    });
  }

  /**
   * Desconectar WebSocket
   */
  desconectarSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.conectado.set(false);
    }
  }

  /**
   * Unirse a sala de conversación
   */
  unirseAConversacion(conversacionId: number) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join-conversacion', conversacionId);
      this.conversacionActiva.set(conversacionId);
    }
  }

  /**
   * Salir de sala de conversación
   */
  salirDeConversacion(conversacionId: number) {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave-conversacion', conversacionId);
      this.conversacionActiva.set(null);
    }
  }

  /**
   * Enviar mensaje por WebSocket
   */
  enviarMensajeSocket(conversacionId: number, contenido: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:enviar-mensaje', {
        conversacionId,
        contenido
      });
    }
  }

  /**
   * Notificar que se está escribiendo
   */
  notificarEscribiendo(conversacionId: number, escribiendo: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('chat:escribiendo', {
        conversacionId,
        escribiendo
      });
    }
  }

  /**
   * Marcar mensajes como leídos por WebSocket
   */
  marcarLeidosSocket(conversacionId: number) {
    if (this.socket?.connected) {
      this.socket.emit('chat:marcar-leidos', { conversacionId });
    }
  }

  // ===== API REST =====

  /**
   * Obtener todas las conversaciones
   */
  async obtenerConversaciones(): Promise<Conversacion[]> {
    const response = await fetch(`${this.apiUrl}/chat/conversaciones`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener conversaciones');
    
    const data = await response.json();
    this.conversaciones.set(data.conversaciones);
    this.actualizarTotalNoLeidos();
    return data.conversaciones;
  }

  /**
   * Obtener o crear conversación con otro usuario
   */
  async obtenerOCrearConversacion(otroUsuarioRut: string): Promise<Conversacion> {
    const response = await fetch(`${this.apiUrl}/chat/conversaciones/${otroUsuarioRut}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener conversación');
    
    const data = await response.json();
    return data.conversacion;
  }

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(conversacionId: number, limit = 50, offset = 0): Promise<Mensaje[]> {
    const response = await fetch(
      `${this.apiUrl}/chat/conversaciones/${conversacionId}/mensajes?limit=${limit}&offset=${offset}`,
      { headers: this.getHeaders() }
    );
    
    if (!response.ok) throw new Error('Error al obtener mensajes');
    
    const data = await response.json();
    this.mensajesActuales.set(data.mensajes);
    return data.mensajes;
  }

  /**
   * Enviar mensaje por API REST (alternativa a WebSocket)
   */
  async enviarMensajeAPI(conversacionId: number, contenido: string): Promise<Mensaje> {
    const response = await fetch(
      `${this.apiUrl}/chat/conversaciones/${conversacionId}/mensajes`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ contenido })
      }
    );
    
    if (!response.ok) throw new Error('Error al enviar mensaje');
    
    const data = await response.json();
    return data.mensaje;
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeidos(conversacionId: number): Promise<void> {
    const response = await fetch(
      `${this.apiUrl}/chat/conversaciones/${conversacionId}/marcar-leidos`,
      {
        method: 'PUT',
        headers: this.getHeaders()
      }
    );
    
    if (!response.ok) throw new Error('Error al marcar mensajes como leídos');
    
    // Actualizar localmente
    await this.obtenerConversaciones();
  }

  /**
   * Obtener total de mensajes no leídos
   */
  async obtenerTotalNoLeidos(): Promise<number> {
    const response = await fetch(`${this.apiUrl}/chat/no-leidos`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener total no leídos');
    
    const data = await response.json();
    this.totalNoLeidos.set(data.total);
    return data.total;
  }

  /**
   * Buscar usuarios
   */
  async buscarUsuarios(busqueda: string): Promise<Usuario[]> {
    const response = await fetch(
      `${this.apiUrl}/chat/usuarios/buscar?q=${encodeURIComponent(busqueda)}`,
      { headers: this.getHeaders() }
    );
    
    if (!response.ok) throw new Error('Error al buscar usuarios');
    
    const data = await response.json();
    return data.usuarios;
  }

  // ===== Handlers de eventos WebSocket =====

  private handleNuevoMensaje(data: any) {
    const { conversacionId, mensaje } = data;
    
    // Si estamos viendo esta conversación, agregar el mensaje
    if (this.conversacionActiva() === conversacionId) {
      const mensajesActuales = this.mensajesActuales();
      this.mensajesActuales.set([...mensajesActuales, mensaje]);
      
      // Marcar como leído automáticamente
      this.marcarLeidosSocket(conversacionId);
    } else {
      // Actualizar contador de no leídos
      this.actualizarConversacionNoLeidos(conversacionId, 1);
    }
    
    // Actualizar lista de conversaciones
    this.obtenerConversaciones().catch(console.error);
  }

  private handleNotificacionMensaje(data: any) {
    
    // Actualizar contador total
    const total = this.totalNoLeidos();
    this.totalNoLeidos.set(total + 1);
    
    // Puedes mostrar una notificación de escritorio aquí
    if (Notification.permission === 'granted') {
      new Notification(`Nuevo mensaje de ${data.remitente.nombre}`, {
        body: data.preview,
        icon: '/assets/chat-icon.png'
      });
    }
  }

  private handleMensajesLeidos(data: any) {
    const { conversacionId } = data;
    
    // Actualizar mensajes actuales como leídos
    if (this.conversacionActiva() === conversacionId) {
      const mensajes = this.mensajesActuales();
      const mensajesActualizados = mensajes.map(m => ({ ...m, leido: true }));
      this.mensajesActuales.set(mensajesActualizados);
    }
  }

  private actualizarConversacionNoLeidos(conversacionId: number, incremento: number) {
    const conversaciones = this.conversaciones();
    const actualizadas = conversaciones.map(c => {
      if (c.id === conversacionId) {
        return { ...c, mensajes_no_leidos: c.mensajes_no_leidos + incremento };
      }
      return c;
    });
    this.conversaciones.set(actualizadas);
    this.actualizarTotalNoLeidos();
  }

  private actualizarTotalNoLeidos() {
    const conversaciones = this.conversaciones();
    const total = conversaciones.reduce((sum, c) => sum + c.mensajes_no_leidos, 0);
    this.totalNoLeidos.set(total);
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
}
