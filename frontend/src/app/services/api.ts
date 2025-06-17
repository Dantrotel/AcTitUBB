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
    return this.http.get(`${this.baseUrl}/propuestas/${id}`, {
      headers: this.getHeaders()
    });
  }

  createPropuesta(data: any) {
    return this.http.post(`${this.baseUrl}/propuestas/`, data, {
      headers: this.getHeaders()
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
    return this.http.put(`${this.baseUrl}/${id}/asignar-profesor`, data, {
      headers: this.getHeaders()
    });
  }

  deletePropuesta(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }


}
