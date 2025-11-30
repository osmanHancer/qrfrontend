import { Component, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyDto, CompaniesService } from '../../services/companies.service';
import { CommonModule } from '@angular/common';
import { register } from 'swiper/element/bundle';

// Swiper bileşenlerini kaydet
register();

@Component({
  selector: 'app-company',
  templateUrl: './company.html',
  styleUrls: ['./company.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Company implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef<any>;
  
  company: CompanyDto | null = null;
  mediaFiles: Array<{url: string, filename: string, isVideo: boolean}> = [];
  isLoading = true;
  error: string | null = null;
  showModal = false;
  selectedIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private service: CompaniesService
  ) {}

  ngOnInit(): void {
    const companyCode = this.route.snapshot.paramMap.get('companyCode');
    if (companyCode) {
      this.service.getByCompanyCode(companyCode).subscribe({
        next: (company: any) => {
          this.company = company;
          this.isLoading = false;
          this.loadMedia();
        },
        error: () => {
          this.error = 'Şirket bulunamadı';
          this.isLoading = false;
        }
      });
    }
  }

  loadMedia(): void {
    if (!this.company) return;
    this.service.getMedia(this.company.companyCode).subscribe({
      next: (res: { media: any[]; }) => {
        // Medya dosyalarını fotoğraf ve video olarak ayır
        this.mediaFiles = res.media.map(filename => {
          const url = this.service.getMediaUrl(this.company!.companyCode, filename);
          const ext = filename.toLowerCase().split('.').pop();
          const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext || '');
          return { url, filename, isVideo };
        });
      },
      error: () => console.log('Medyalar yüklenemedi')
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
    if (!this.company) return '';
    return this.service.getQRCodeUrl(this.company.companyCode);
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

