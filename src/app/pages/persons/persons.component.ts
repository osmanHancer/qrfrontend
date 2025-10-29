import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { PersonsService, PersonDto, CreatePersonDto, UpdatePersonDto } from '../../services/persons.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-persons',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent implements OnInit {
  persons: PersonDto[] = [];
  filteredPersons: PersonDto[] = [];
  searchTerm: string = '';
  showAddForm: boolean = false;
  showEditForm: boolean = false;
  selectedPerson: PersonDto | null = null;
  selectedImages: File[] = [];
  personImages: { [tcno: string]: string[] } = {};
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  // Form data
  newPerson: CreatePersonDto = {
    tcno: '',
    ad: '',
    soyad: '',
    dogumTarihi: '',
    olumTarihi: '',
    biyografi: ''
  };

  editPerson: UpdatePersonDto = {
    ad: '',
    soyad: '',
    dogumTarihi: '',
    olumTarihi: '',
    biyografi: ''
  };

  constructor(
    private personsService: PersonsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons() {
    this.personsService.getAll().subscribe({
      next: (persons) => {
        this.persons = persons;
        this.filteredPersons = persons;
      },
      error: (error) => {
        console.error('Kişiler yüklenirken hata:', error);
        alert('Kişiler yüklenirken bir hata oluştu');
      }
    });
  }

  loadImagesFor(tcno: string) {
    this.personsService.getImages(tcno).subscribe({
      next: (response) => {
        this.personImages[tcno] = response.images || [];
      },
      error: () => {
        this.personImages[tcno] = [];
      }
    });
  }

  searchPersons() {
    if (!this.searchTerm.trim()) {
      this.filteredPersons = this.persons;
    } else {
      this.filteredPersons = this.persons.filter(person =>
        person.ad.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        person.soyad.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        person.tcno.includes(this.searchTerm)
      );
    }
  }

  showAddPersonForm() {
    this.showAddForm = true;
    this.showEditForm = false;
    this.newPerson = {
      tcno: '',
      ad: '',
      soyad: '',
      dogumTarihi: '',
      olumTarihi: '',
      biyografi: ''
    };
  }

  showEditPersonForm(person: PersonDto) {
    this.showEditForm = true;
    this.showAddForm = false;
    this.selectedPerson = person;
    this.editPerson = {
      ad: person.ad,
      soyad: person.soyad,
      dogumTarihi: person.dogumTarihi,
      olumTarihi: person.olumTarihi || '',
      biyografi: person.biyografi || ''
    };
    this.loadImagesFor(person.tcno);
  }

  cancelForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.selectedPerson = null;
    this.selectedImages = [];
  }

  addPerson() {
    if (!this.newPerson.tcno || !this.newPerson.ad || !this.newPerson.soyad || !this.newPerson.dogumTarihi) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    this.personsService.create(this.newPerson).subscribe({
      next: (person) => {
        this.persons.push(person);
        this.filteredPersons = [...this.persons];
        alert('Kişi başarıyla eklendi');
        
        // Resim yükleme işlemi
        if (this.selectedImages.length > 0) {
          console.log(`${this.selectedImages.length} resim yükleniyor...`);
          this.uploadImages(person.tcno);
        } else {
          this.cancelForm();
        }
      },
      error: (error) => {
        console.error('Kişi eklenirken hata:', error);
        alert('Kişi eklenirken bir hata oluştu');
      }
    });
  }

  updatePerson() {
    if (!this.selectedPerson || !this.editPerson.ad || !this.editPerson.soyad || !this.editPerson.dogumTarihi) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    this.personsService.update(this.selectedPerson.id, this.editPerson).subscribe({
      next: (updatedPerson) => {
        const index = this.persons.findIndex(p => p.id === updatedPerson.id);
        if (index !== -1) {
          this.persons[index] = updatedPerson;
          this.filteredPersons = [...this.persons];
        }
        this.cancelForm();
        alert('Kişi başarıyla güncellendi');
        
        // Resim yükleme işlemi
        if (this.selectedImages.length > 0) {
          this.uploadImages(updatedPerson.tcno);
        }
      },
      error: (error) => {
        console.error('Kişi güncellenirken hata:', error);
        alert('Kişi güncellenirken bir hata oluştu');
      }
    });
  }

  deletePerson(person: PersonDto) {
    if (confirm(`${person.ad} ${person.soyad} adlı kişiyi silmek istediğinizden emin misiniz?`)) {
      this.personsService.delete(person.id).subscribe({
        next: () => {
          this.persons = this.persons.filter(p => p.id !== person.id);
          this.filteredPersons = [...this.persons];
          alert('Kişi başarıyla silindi');
        },
        error: (error) => {
          console.error('Kişi silinirken hata:', error);
          alert('Kişi silinirken bir hata oluştu');
        }
      });
    }
  }

  onImageSelected(event: any) {
    const files = event.target.files;
    this.selectedImages = Array.from(files);
  }

  onImageSelectedForPerson(event: any, tcno: string) {
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
        
        this.personsService.uploadImage(tcno, fileObj).subscribe({
          next: (response) => {
            console.log(`Resim ${index + 1} yüklendi:`, response);
            completedUploads++;
            successfulUploads++;
            
            if (completedUploads === totalUploads) {
              this.loadImagesFor(tcno);
              
              if (failedUploads === 0) {
                alert(`${successfulUploads} resim başarıyla yüklendi`);
              } else {
                alert(`${successfulUploads} resim başarıyla yüklendi, ${failedUploads} resimde hata oluştu`);
              }
            }
          },
          error: (error) => {
            console.error(`Resim ${index + 1} yüklenirken hata:`, error);
            completedUploads++;
            failedUploads++;
            
            if (completedUploads === totalUploads) {
              this.loadImagesFor(tcno); // Resimleri yeniden yükle
              
              if (successfulUploads > 0) {
                alert(`${successfulUploads} resim başarıyla yüklendi, ${failedUploads} resimde hata oluştu`);
              } else {
                alert('Resim yükleme başarısız oldu');
              }
            }
          }
        });
      });
    } else {
      console.log('Hiç dosya seçilmedi');
    }
  }

  uploadImages(tcno: string) {
    let completedUploads = 0;
    let successfulUploads = 0;
    let failedUploads = 0;
    const totalUploads = this.selectedImages.length;
    
    this.selectedImages.forEach((file, index) => {
      console.log(`Resim ${index + 1}/${totalUploads} yükleniyor:`, file.name);
      
      this.personsService.uploadImage(tcno, file).subscribe({
        next: (response) => {
          console.log(`Resim ${index + 1} yüklendi:`, response);
          completedUploads++;
          successfulUploads++;
          
          if (completedUploads === totalUploads) {
            console.log('Tüm resimler yüklendi, resimler yeniden yükleniyor...');
            this.loadImagesFor(tcno); 
            this.cancelForm();
            
            if (failedUploads === 0) {
              alert(`${successfulUploads} resim başarıyla yüklendi`);
            } else {
              alert(`${successfulUploads} resim başarıyla yüklendi, ${failedUploads} resimde hata oluştu`);
            }
          }
        },
        error: (error) => {
          console.error(`Resim ${index + 1} yüklenirken hata:`, error);
          completedUploads++;
          failedUploads++;
          
          if (completedUploads === totalUploads) {
            this.loadImagesFor(tcno);
            this.cancelForm();
            
            if (successfulUploads > 0) {
              alert(`${successfulUploads} resim başarıyla yüklendi, ${failedUploads} resimde hata oluştu`);
            } else {
              alert('Resim yükleme başarısız oldu');
            }
          }
        }
      });
    });
    
    this.selectedImages = [];
  }

  removeImage(tcno: string, imagePath: string) {
    this.personsService.removeImage(tcno, imagePath).subscribe({
      next: () => {
        this.loadImagesFor(tcno);
        alert('Resim başarıyla silindi');
      },
      error: (error) => {
        console.error('Resim silinirken hata:', error);
        alert('Resim silinirken bir hata oluştu');
      }
    });
  }

  getImageUrl(tcno: string, filename: string): string {
    const url = this.personsService.getImageUrl(tcno, filename);
    console.log(`Resim URL oluşturuldu: ${tcno}/${filename} -> ${url}`);
    return url;
  }

  onImageLoad(event: any, image: string, tcno: string) {
    console.log(`Resim yüklendi: ${image} (${tcno})`);
  }

  onImageError(event: any, image: string, tcno: string) {
    console.error(`Resim yüklenemedi: ${image} (${tcno})`, event);
    alert(`Resim yüklenemedi: ${image}`);
  }

  getQRCodeUrl(tcno: string): string {
    return this.personsService.getQRCodeUrl(tcno);
  }

  downloadQRCode(tcno: string, ad: string, soyad: string) {
    this.personsService.downloadQRCode(tcno).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${ad}-${soyad}-${tcno}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('QR kod indirilirken hata:', error);
        alert('QR kod indirilirken bir hata oluştu');
      }
    });
  }

  generateQRCode(tcno: string) {
    this.personsService.generateQRCode(tcno).subscribe({
      next: (response) => {
        console.log('QR kod oluşturuldu:', response);
        alert('QR kod başarıyla oluşturuldu');
        this.loadPersons(); // Kişileri yeniden yükle
      },
      error: (error) => {
        console.error('QR kod oluşturulurken hata:', error);
        alert('QR kod oluşturulurken bir hata oluştu');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('tr-TR');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}
