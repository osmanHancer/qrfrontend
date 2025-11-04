import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tanitim',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tanitim.component.html',
  styleUrls: ['./tanitim.component.scss']
})
export class TanitimComponent implements OnInit {
  phoneNumber = '+90 542 238 38 52';
  instagramUrl = 'https://www.instagram.com/anitasiqr/?igsh=MTV5bGNidDM1bzZqOQ#';
  instagramHandle = '@anitasiqr';

  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit(): void {
    // Sayfa başlığı
    this.title.setTitle('Kayseri Mezar QR Kod | Anıtaşı QR - Mezarlık QR Kod Hizmeti');

    // Meta tags
    this.meta.updateTag({ 
      name: 'description', 
      content: 'Kayseri mezarlık QR kod hizmeti. Mezar taşına QR kod yerleştirme, dijital anı sayfası, fotoğraf ve video galerisi. Gümüş, Altın, Elmas paket seçenekleri. Kayseri ilçeleri montaj ücretsiz, tüm Türkiye\'ye ücretsiz kargo.' 
    });

    this.meta.updateTag({ 
      name: 'keywords', 
      content: 'kayseri qr kod, kayseri mezar qr, mezar qr kod, mezarlık qr kod, anı taşı qr, kayseri anı taşı, qr kod mezar, dijital mezar, anı sayfası, mezar taşı qr, kayseri mezarlık, anıtaşı qr, mezarlık dijital, kayseri anıtaşı' 
    });

    // Open Graph
    this.meta.updateTag({ 
      property: 'og:title', 
      content: 'Kayseri Mezar QR Kod | Anıtaşı QR - Mezarlık QR Kod Hizmeti' 
    });

    this.meta.updateTag({ 
      property: 'og:description', 
      content: 'Kayseri mezarlık QR kod hizmeti. Mezar taşına QR kod yerleştirme, dijital anı sayfası, fotoğraf ve video galerisi. Profesyonel hizmet, uygun fiyatlar.' 
    });

    this.meta.updateTag({ 
      property: 'og:url', 
      content: 'https://anitasiqr.com/tanitim' 
    });
  }

  get phoneNumberForTel(): string {
    return this.phoneNumber.replace(/\s/g, '');
  }

  callPhone(): void {
    window.location.href = `tel:${this.phoneNumberForTel}`;
  }
}

