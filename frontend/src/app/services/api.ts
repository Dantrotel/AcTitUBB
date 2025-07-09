import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';
   private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.baseUrl}/users/login`, data);
  }

  register(data:any){
    return this.http.post(`${this.baseUrl}/users/register`, data);
  }

  getPropuestas() {
    return this.http.get(`${this.baseUrl}/propuestas/`, {
      headers: this.getHeaders()
    });
  }

  getPropuestaById(id: string) {
    return this.http.get(`${this.baseUrl}/propuestas/get/${id}`, {
      headers: this.getHeaders()
    });
  }

 createPropuesta(data: FormData) {
  const token = localStorage.getItem('token');
  return this.http.post(`${this.baseUrl}/propuestas/`, data, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
    // ¡NO pongas Content-Type aquí!
  });
}

  updatePropuesta(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/propuestas/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  revisarPropuesta(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}/revisar`, data, {
      headers: this.getHeaders()
    });
  }

  asignarPropuesta(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/propuestas/${id}/asignar-profesor`, data, {
      headers: this.getHeaders()
    });
  }

  deletePropuesta(id: string) {
    return this.http.delete(`${this.baseUrl}/propuestas/${id}`, {
      headers: this.getHeaders()
    });
  }

  descargarArchivo(nombreArchivo: string) {
    const url = `${this.baseUrl}/descargar/${nombreArchivo}`;
    return this.http.get(url, {
      headers: this.getHeaders(),
      responseType: 'blob' // Muy importante para descargar archivos binarios
    });
  
  }
}
