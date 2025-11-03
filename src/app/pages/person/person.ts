import { Component, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonDto, PersonsService } from '../../services/persons.service';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// Swiper bileşenlerini kaydet
register();

@Component({
  selector: 'app-person',
  templateUrl: './person.html',
  styleUrls: ['./person.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Person implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef<any>;
  
  person: PersonDto | null = null;
  images: string[] = [];
  mediaFiles: Array<{url: string, filename: string, isVideo: boolean}> = [];
  isLoading = true;
  error: string | null = null;
  showModal = false;
  selectedIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private service: PersonsService
  ) {}

  ngOnInit(): void {
    const tcno = this.route.snapshot.paramMap.get('tcno');
    if (tcno) {
      this.service.getByTcno(tcno).subscribe({
        next: (person: any) => {
          this.person = person;
          this.isLoading = false;
          this.loadImages();
        },
        error: () => {
          this.error = 'Kişi bulunamadı';
          this.isLoading = false;
        }
      });
    }
  }

  loadImages(): void {
    if (!this.person) return;
    this.service.getImages(this.person.tcno).subscribe({
      next: (res: { images: any[]; }) => {
        this.images = res.images.map(f => this.service.getImageUrl(this.person!.tcno, f));
        // Medya dosyalarını fotoğraf ve video olarak ayır
        this.mediaFiles = res.images.map(filename => {
          const url = this.service.getImageUrl(this.person!.tcno, filename);
          const ext = filename.toLowerCase().split('.').pop();
          const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '');
          return { url, filename, isVideo };
        });
      },
      error: () => console.log('Görseller yüklenemedi')
    });
  }

  isVideoFile(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop();
    return ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '');
  }

  ngAfterViewInit(): void {
    // Swiper container hazır olduğunda
  }

  openModal(index: number): void {
    // Önce selectedIndex'i ayarla
    this.selectedIndex = index;
    // Modal'ı aç
    this.showModal = true;
    
    // Swiper'ı hemen kontrol et ve doğru slide'a ayarla
    // DOM'un render edilmesi için bir sonraki tick'i bekle
    Promise.resolve().then(() => {
      this.setInitialSlide();
    });
  }
  
  private setInitialSlide(): void {
    if (!this.swiperContainer?.nativeElement) {
      // Element henüz DOM'da değilse, çok kısa bir süre sonra tekrar dene
      requestAnimationFrame(() => this.setInitialSlide());
      return;
    }
    
    const swiperEl = this.swiperContainer.nativeElement as any;
    const containerEl = swiperEl.closest('.swiper-modal-content');
    
    // Swiper henüz başlatılmadıysa, başlatılmasını bekle
    if (!swiperEl.swiper) {
      // Swiper'ın başlatılmasını bekle - swiper event'ini dinle
      const initSwiper = () => {
        if (swiperEl.swiper) {
          // Swiper başlatıldı, hemen doğru slide'a git (speed 0 = anında)
          if (swiperEl.swiper.activeIndex !== this.selectedIndex) {
            // Transition'ı geçici olarak devre dışı bırak
            swiperEl.swiper.setTransition(0);
            swiperEl.swiper.slideTo(this.selectedIndex, 0);
            // Bir sonraki frame'de transition'ı geri aç ve opacity'yi göster
            requestAnimationFrame(() => {
              swiperEl.swiper.setTransition(300);
              swiperEl.classList.add('swiper-initialized');
            });
          } else {
            // Zaten doğru slide'daysa, sadece göster
            swiperEl.classList.add('swiper-initialized');
          }
        } else {
          // Hala hazır değil, tekrar dene
          requestAnimationFrame(initSwiper);
        }
      };
      
      // Swiper event'ini dinle
      swiperEl.addEventListener('swiper', initSwiper, { once: true });
      // Ayrıca hemen kontrol et
      requestAnimationFrame(initSwiper);
    } else {
      // Swiper zaten başlatılmış, doğru slide'a git
      if (swiperEl.swiper.activeIndex !== this.selectedIndex) {
        swiperEl.swiper.setTransition(0);
        swiperEl.swiper.slideTo(this.selectedIndex, 0);
        requestAnimationFrame(() => {
          swiperEl.swiper.setTransition(300);
          swiperEl.classList.add('swiper-initialized');
        });
      } else {
        swiperEl.classList.add('swiper-initialized');
      }
    }
  }


  closeModal(): void {
    this.showModal = false;
  }

  getQRCodeUrl(): string {
    if (!this.person) return '';
    return this.service.getQRCodeUrl(this.person.tcno);
  }

  getVideoType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const videoTypes: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm'
    };
    return videoTypes[ext || ''] || 'video/mp4';
  }

  /**
   * Konum bilgisinin koordinat formatında olup olmadığını kontrol eder
   */
  isCoordinateFormat(konum: string): boolean {
    if (!konum) return false;
    // Koordinat formatı: "41.0082, 28.9784" veya "41.0082,28.9784"
    const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    return coordinatePattern.test(konum.trim());
  }

  /**
   * Koordinat için Google Maps linki oluşturur
   */
  getGoogleMapsUrl(konum: string): string {
    if (!this.isCoordinateFormat(konum)) return '';
    const coords = konum.trim().replace(/\s+/g, '');
    return `https://www.google.com/maps?q=${coords}`;
  }
}
