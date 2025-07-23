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
    });
  }

  getPropuestaById(id: string) {
    return this.http.get(`${this.baseUrl}/propuestas/get/${id}`, {
    });
  }

 createPropuesta(data: FormData) {
  const token = localStorage.getItem('token');
  return this.http.post(`${this.baseUrl}/propuestas/`, data, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  });
}

  updatePropuesta(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/propuestas/${id}`, data, {
    });
  }

  revisarPropuesta(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/${id}/revisar`, data, {
    });
  }

  asignarPropuesta(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/propuestas/${id}/asignar-profesor`, data, {
    });
  }

  deletePropuesta(id: string) {
    return this.http.delete(`${this.baseUrl}/propuestas/${id}`, {
    });
  }

  descargarArchivo(nombreArchivo: string) {
    const url = `${this.baseUrl}/descargar/${nombreArchivo}`;
    return this.http.get(url, {
      responseType: 'blob' // Muy importante para descargar archivos binarios
    });
  }

  buscaruserByrut(rut:string){
    return this.http.get(`${this.baseUrl}/users/${rut}`);
  }
}
