import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';
import { CompaniesService, CompanyDto, CreateCompanyDto, UpdateCompanyDto } from '../../services/companies.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  @ViewChild('editQuillEditor', { static: false }) editQuillEditor!: QuillEditorComponent;
  
  companies: CompanyDto[] = [];
  filteredCompanies: CompanyDto[] = [];
  searchTerm: string = '';
  showAddForm: boolean = false;
  showEditForm: boolean = false;
  selectedCompany: CompanyDto | null = null;
  selectedMedia: File[] = [];
  companyMedia: { [companyCode: string]: string[] } = {};
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  
  constructor(
    private companiesService: CompaniesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  
  // Form data
  newCompany: CreateCompanyDto = {
    sirketIsmi: '',
    konum: '',
    website: '',
    sirketTanitimi: ''
  };

  editCompany: UpdateCompanyDto = {
    sirketIsmi: '',
    konum: '',
    website: '',
    sirketTanitimi: ''
  };

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companiesService.getAll().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.filteredCompanies = companies;
      },
      error: (error) => {
        console.error('Şirketler yüklenirken hata:', error);
        alert('Şirketler yüklenirken bir hata oluştu');
      }
    });
  }

  loadMediaFor(companyCode: string) {
    this.companiesService.getMedia(companyCode).subscribe({
      next: (response) => {
        this.companyMedia[companyCode] = response.media || [];
      },
      error: () => {
        this.companyMedia[companyCode] = [];
      }
    });
  }

  searchCompanies() {
    if (!this.searchTerm.trim()) {
      this.filteredCompanies = this.companies;
    } else {
      this.filteredCompanies = this.companies.filter(company =>
        company.sirketIsmi.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        company.companyCode.includes(this.searchTerm)
      );
    }
  }

  showAddCompanyForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.newCompany = {
      sirketIsmi: '',
      konum: '',
      website: '',
      sirketTanitimi: ''
    };
  }

  onEditEditorCreated(editor: any) {
    // Quill editor oluşturulduğunda, eğer seçili şirketin tanıtımı varsa yükle
    if (this.selectedCompany?.sirketTanitimi && editor) {
      setTimeout(() => {
        try {
          editor.clipboard.dangerouslyPasteHTML(this.selectedCompany!.sirketTanitimi || '');
          this.editCompany.sirketTanitimi = this.selectedCompany!.sirketTanitimi || '';
        } catch (error) {
          console.error('Quill editor içerik yükleme hatası:', error);
        }
      }, 10);
    }
  }

  showEditCompanyForm(company: CompanyDto) {
    this.showEditForm = true;
    this.showAddForm = false;
    this.selectedCompany = company;
    this.editCompany = {
      sirketIsmi: company.sirketIsmi,
      konum: company.konum || '',
      website: company.website || '',
      sirketTanitimi: company.sirketTanitimi || ''
    };
    this.loadMediaFor(company.companyCode);
    
    // Quill editor'ün başlatılmasını bekle ve tanıtımı ayarla
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.editQuillEditor?.quillEditor && company.sirketTanitimi) {
        try {
          this.editQuillEditor.quillEditor.clipboard.dangerouslyPasteHTML(company.sirketTanitimi);
          this.editCompany.sirketTanitimi = company.sirketTanitimi;
        } catch (error) {
          console.error('Quill editor içerik yükleme hatası:', error);
          this.editCompany.sirketTanitimi = company.sirketTanitimi;
        }
      }
    }, 150);
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.selectedCompany = null;
    this.selectedMedia = [];
  }

  addCompany() {
    if (!this.newCompany.sirketIsmi) {
      alert('Lütfen şirket ismini girin');
      return;
    }

    this.companiesService.create(this.newCompany).subscribe({
      next: (company) => {
        this.companies.push(company);
        this.filteredCompanies = [...this.companies];
        alert('Şirket başarıyla eklendi');
        
        // Medya yükleme işlemi
        if (this.selectedMedia.length > 0) {
          console.log(`${this.selectedMedia.length} medya yükleniyor...`);
          this.uploadMedia(company.companyCode);
        } else {
          this.cancelForm();
        }
      },
      error: (error) => {
        console.error('Şirket eklenirken hata:', error);
        alert('Şirket eklenirken bir hata oluştu');
      }
    });
  }

  updateCompany() {
    if (!this.selectedCompany || !this.editCompany.sirketIsmi) {
      alert('Lütfen şirket ismini girin');
      return;
    }

    this.companiesService.update(this.selectedCompany.id, this.editCompany).subscribe({
      next: (updatedCompany) => {
        const index = this.companies.findIndex(c => c.id === updatedCompany.id);
        if (index !== -1) {
          this.companies[index] = updatedCompany;
          this.filteredCompanies = [...this.companies];
        }
        this.cancelForm();
        alert('Şirket başarıyla güncellendi');
        
        // Medya yükleme işlemi
        if (this.selectedMedia.length > 0) {
          this.uploadMedia(updatedCompany.companyCode);
        }
      },
      error: (error) => {
        console.error('Şirket güncellenirken hata:', error);
        alert('Şirket güncellenirken bir hata oluştu');
      }
    });
  }

  deleteCompany(company: CompanyDto) {
    if (confirm(`${company.sirketIsmi} adlı şirketi silmek istediğinizden emin misiniz?`)) {
      this.companiesService.delete(company.id).subscribe({
        next: () => {
          this.companies = this.companies.filter(c => c.id !== company.id);
          this.filteredCompanies = [...this.companies];
          alert('Şirket başarıyla silindi');
        },
        error: (error) => {
          console.error('Şirket silinirken hata:', error);
          alert('Şirket silinirken bir hata oluştu');
        }
      });
    }
  }

  onMediaSelected(event: any) {
    const files = event.target.files;
    this.selectedMedia = Array.from(files);
  }

  onMediaSelectedForCompany(event: any, companyCode: string) {
    const files = event.target.files;
    console.log('Seçilen dosyalar:', files);
    
    if (files && files.length > 0) {
      console.log(`${files.length} dosya seçildi, yükleniyor...`);
      
      let completedUploads = 0;
      let successfulUploads = 0;
      let failedUploads = 0;
      const totalUploads = files.length;
      
      Array.from(files).forEach((file, index) => {
        const fileObj = file as File;
        console.log(`Dosya ${index + 1}:`, fileObj.name, fileObj.type, fileObj.size);
        
        this.companiesService.uploadMedia(companyCode, fileObj).subscribe({
          next: (response) => {
            console.log(`Medya ${index + 1} yüklendi:`, response);
            completedUploads++;
            successfulUploads++;
            
            if (completedUploads === totalUploads) {
              this.loadMediaFor(companyCode);
              
              if (failedUploads === 0) {
                alert(`${successfulUploads} medya başarıyla yüklendi`);
              } else {
                alert(`${successfulUploads} medya başarıyla yüklendi, ${failedUploads} medyada hata oluştu`);
              }
            }
          },
          error: (error) => {
            console.error(`Medya ${index + 1} yüklenirken hata:`, error);
            completedUploads++;
            failedUploads++;
            
            if (completedUploads === totalUploads) {
              this.loadMediaFor(companyCode);
              
              if (successfulUploads > 0) {
                alert(`${successfulUploads} medya başarıyla yüklendi, ${failedUploads} medyada hata oluştu`);
              } else {
                alert('Medya yükleme başarısız oldu');
              }
            }
          }
        });
      });
    } else {
      console.log('Hiç dosya seçilmedi');
    }
  }

  uploadMedia(companyCode: string) {
    let completedUploads = 0;
    let successfulUploads = 0;
    let failedUploads = 0;
    const totalUploads = this.selectedMedia.length;
    
    this.selectedMedia.forEach((file, index) => {
      console.log(`Medya ${index + 1}/${totalUploads} yükleniyor:`, file.name);
      
      this.companiesService.uploadMedia(companyCode, file).subscribe({
        next: (response) => {
          console.log(`Medya ${index + 1} yüklendi:`, response);
          completedUploads++;
          successfulUploads++;
          
          if (completedUploads === totalUploads) {
            console.log('Tüm medyalar yüklendi, medyalar yeniden yükleniyor...');
            this.loadMediaFor(companyCode); 
            this.cancelForm();
            
            if (failedUploads === 0) {
              alert(`${successfulUploads} medya başarıyla yüklendi`);
            } else {
              alert(`${successfulUploads} medya başarıyla yüklendi, ${failedUploads} medyada hata oluştu`);
            }
          }
        },
        error: (error) => {
          console.error(`Medya ${index + 1} yüklenirken hata:`, error);
          completedUploads++;
          failedUploads++;
          
          if (completedUploads === totalUploads) {
            this.loadMediaFor(companyCode);
            this.cancelForm();
            
            if (successfulUploads > 0) {
              alert(`${successfulUploads} medya başarıyla yüklendi, ${failedUploads} medyada hata oluştu`);
            } else {
              alert('Medya yükleme başarısız oldu');
            }
          }
        }
      });
    });
    
    this.selectedMedia = [];
  }

  removeMedia(companyCode: string, mediaPath: string) {
    this.companiesService.removeMedia(companyCode, mediaPath).subscribe({
      next: () => {
        this.loadMediaFor(companyCode);
        alert('Medya başarıyla silindi');
      },
      error: (error) => {
        console.error('Medya silinirken hata:', error);
        alert('Medya silinirken bir hata oluştu');
      }
    });
  }

  getMediaUrl(companyCode: string, filename: string): string {
    const url = this.companiesService.getMediaUrl(companyCode, filename);
    console.log(`Medya URL oluşturuldu: ${companyCode}/${filename} -> ${url}`);
    return url;
  }

  onMediaLoad(event: any, media: string, companyCode: string) {
    console.log(`Medya yüklendi: ${media} (${companyCode})`);
  }

  onMediaError(event: any, media: string, companyCode: string) {
    console.error(`Medya yüklenemedi: ${media} (${companyCode})`, event);
    alert(`Medya yüklenemedi: ${media}`);
  }

  isVideoFile(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop();
    return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '');
  }

  getQRCodeUrl(companyCode: string): string {
    return this.companiesService.getQRCodeUrl(companyCode);
  }

  downloadQRCode(companyCode: string, sirketIsmi: string) {
    this.companiesService.downloadQRCode(companyCode).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${sirketIsmi}-${companyCode}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('QR kod indirilirken hata:', error);
        alert('QR kod indirilirken bir hata oluştu');
      }
    });
  }

  generateQRCode(companyCode: string) {
    this.companiesService.generateQRCode(companyCode).subscribe({
      next: (response) => {
        console.log('QR kod oluşturuldu:', response);
        alert('QR kod başarıyla oluşturuldu');
        this.loadCompanies(); // Şirketleri yeniden yükle
      },
      error: (error) => {
        console.error('QR kod oluşturulurken hata:', error);
        alert('QR kod oluşturulurken bir hata oluştu');
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

