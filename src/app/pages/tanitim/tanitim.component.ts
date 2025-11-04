import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tanitim',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tanitim.component.html',
  styleUrls: ['./tanitim.component.scss']
})
export class TanitimComponent {
  phoneNumber = '+90 542 238 38 52';
  instagramUrl = 'https://www.instagram.com/anitasiqr/?igsh=MTV5bGNidDM1bzZqOQ#';
  instagramHandle = '@anitasiqr';

  get phoneNumberForTel(): string {
    return this.phoneNumber.replace(/\s/g, '');
  }

  callPhone(): void {
    window.location.href = `tel:${this.phoneNumberForTel}`;
  }
}

