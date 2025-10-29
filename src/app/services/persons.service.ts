import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PersonDto {
  id: number;
  ad: string;
  soyad: string;
  tcno: string;
  dogumTarihi: string;
  olumTarihi?: string;
  gorseller?: string;
  qrKod?: string;
  biyografi?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonDto {
  tcno: string;
  ad: string;
  soyad: string;
  dogumTarihi: string;
  olumTarihi?: string;
  biyografi?: string;
}

export interface UpdatePersonDto {
  ad?: string;
  soyad?: string;
  dogumTarihi?: string;
  olumTarihi?: string;
  biyografi?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<PersonDto[]> {
    return this.http.get<PersonDto[]>(`${this.apiUrl}/persons`);
  }

  getById(id: number): Observable<PersonDto> {
    return this.http.get<PersonDto>(`${this.apiUrl}/persons/${id}`);
  }

  getByTcno(tcno: string): Observable<PersonDto> {
    return this.http.get<PersonDto>(`${this.apiUrl}/persons/tcno/${tcno}`);
  }

  create(person: CreatePersonDto): Observable<PersonDto> {
    return this.http.post<PersonDto>(`${this.apiUrl}/persons`, person);
  }

  update(id: number, person: UpdatePersonDto): Observable<PersonDto> {
    return this.http.patch<PersonDto>(`${this.apiUrl}/persons/${id}`, person);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/persons/${id}`);
  }

  uploadImage(tcno: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.apiUrl}/persons/${tcno}/upload-image`, formData);
  }

  removeImage(tcno: string, imagePath: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/persons/${tcno}/remove-image`, {
      body: { imagePath }
    });
  }

  getImages(tcno: string): Observable<{ images: string[] }> {
    return this.http.get<{ images: string[] }>(`${this.apiUrl}/persons/${tcno}/images`);
  }

  getImageUrl(tcno: string, filename: string): string {
    return `${this.apiUrl}/persons/image/${tcno}/${filename}`;
  }

  getQRCodeUrl(tcno: string): string {
    return `${this.apiUrl}/persons/${tcno}/qr-code`;
  }

  downloadQRCode(tcno: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/persons/${tcno}/qr-code`, {
      responseType: 'blob'
    });
  }

  generateQRCode(tcno: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/persons/${tcno}/generate-qr`, {});
  }
}


