import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgVideo from 'lightgallery/plugins/video';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import { PersonDto, PersonsService } from '../../services/persons.service';
import { LightgalleryModule } from 'lightgallery/angular';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-person',
  templateUrl: './person.html',
  styleUrls: ['./person.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [LightgalleryModule,CommonModule],
})
export class Person implements OnInit {
  person: PersonDto | null = null;
  images: string[] = [];
  mediaFiles: Array<{url: string, filename: string, isVideo: boolean}> = [];
  isLoading = true;
  error: string | null = null;

  settings = {
    plugins: [lgZoom, lgThumbnail, lgVideo],
    counter: true,
    download: true,
    mobileSettings: {
      controls: true,
      showCloseIcon: true,
      download: false
    }
  };

  onBeforeSlide(detail: BeforeSlideDetail): void {
    console.log('Slide:', detail.index, 'Previous:', detail.prevIndex);
  }

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

  getQRCodeUrl(): string {
    if (!this.person) return '';
    return this.service.getQRCodeUrl(this.person.tcno);
  }

  getVideoDataAttribute(videoUrl: string, filename: string): string {
    // Dosya uzantısına göre video type belirle
    const ext = filename.toLowerCase().split('.').pop();
    const videoTypes: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm'
    };
    const videoType = videoTypes[ext || ''] || 'video/mp4';
    
    return JSON.stringify({
      source: [{ src: videoUrl, type: videoType }]
    });
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

  openVideo(videoUrl: string, event: Event): void {
    // Lightgallery video plugin'ini kullanmak yerine direkt video oynatma
    // veya modal açma
    event.preventDefault();
    
    // Video için özel modal açma veya direkt oynatma
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal';
    videoModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      cursor: pointer;
    `;
    
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      outline: none;
    `;
    
    videoModal.appendChild(videoElement);
    document.body.appendChild(videoModal);
    
    videoModal.onclick = (e) => {
      if (e.target === videoModal) {
        document.body.removeChild(videoModal);
      }
    };
    
    videoElement.onclick = (e) => {
      e.stopPropagation();
    };
  }
}
