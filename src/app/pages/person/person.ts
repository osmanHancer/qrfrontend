import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
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
  isLoading = true;
  error: string | null = null;

  settings = {
    plugins: [lgZoom, lgThumbnail],
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
      next: (res: { images: any[]; }) => this.images = res.images.map(f => this.service.getImageUrl(this.person!.tcno, f)),
      error: () => console.log('Görseller yüklenemedi')
    });
  }

  getQRCodeUrl(): string {
    if (!this.person) return '';
    return this.service.getQRCodeUrl(this.person.tcno);
  }
}
