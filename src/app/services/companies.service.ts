import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CompanyDto {
  id: number;
  sirketIsmi: string;
  companyCode: string;
  konum?: string;
  website?: string;
  sirketTanitimi?: string;
  medyalar?: string;
  qrKod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  companyCode?: string; // Opsiyonel, backend'de otomatik oluşturulacak
  sirketIsmi: string;
  konum?: string;
  website?: string;
  sirketTanitimi?: string;
}

export interface UpdateCompanyDto {
  sirketIsmi?: string;
  konum?: string;
  website?: string;
  sirketTanitimi?: string;
}

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getAll(): Observable<CompanyDto[]> {
    return this.http.get<CompanyDto[]>(`${this.apiUrl}/companies`);
  }

  getById(id: number): Observable<CompanyDto> {
    return this.http.get<CompanyDto>(`${this.apiUrl}/companies/${id}`);
  }

  getByCompanyCode(companyCode: string): Observable<CompanyDto> {
    return this.http.get<CompanyDto>(`${this.apiUrl}/companies/code/${companyCode}`);
  }

  create(company: CreateCompanyDto): Observable<CompanyDto> {
    return this.http.post<CompanyDto>(`${this.apiUrl}/companies`, company);
  }

  update(id: number, company: UpdateCompanyDto): Observable<CompanyDto> {
    return this.http.patch<CompanyDto>(`${this.apiUrl}/companies/${id}`, company);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/companies/${id}`);
  }

  uploadMedia(companyCode: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('media', file);
    return this.http.post(`${this.apiUrl}/companies/${companyCode}/upload-media`, formData);
  }

  removeMedia(companyCode: string, mediaPath: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/companies/${companyCode}/remove-media`, {
      body: { mediaPath }
    });
  }

  getMedia(companyCode: string): Observable<{ media: string[] }> {
    return this.http.get<{ media: string[] }>(`${this.apiUrl}/companies/${companyCode}/media`);
  }

  getMediaUrl(companyCode: string, filename: string): string {
    return `${this.apiUrl}/companies/media/${companyCode}/${filename}`;
  }

  getQRCodeUrl(companyCode: string): string {
    return `${this.apiUrl}/companies/${companyCode}/qr-code`;
  }

  downloadQRCode(companyCode: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/companies/${companyCode}/qr-code`, {
      responseType: 'blob'
    });
  }

  generateQRCode(companyCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/companies/${companyCode}/generate-qr`, {});
  }
}

