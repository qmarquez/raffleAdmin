import { Component } from '@angular/core';
import { RafflesService } from './lib/services/mercadopago.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'raffleAdmin';
  showDataForm = false;
  initPoint;
  activeRaffles = [];
  participations = [];

  get resumedParticipations() {
    const raffles = [];

    this.participations
      .forEach(({ item: participationItem }) => {
        const raffle = raffles.find(({ item }) => item === participationItem);

        if (!raffle) {
          raffles.push({ item: participationItem, count: 1 });
        } else {
          raffle.count++;
        }
      });

    return raffles;
  }

  constructor(
    private rafflesService: RafflesService
  ) {
    this.init();
  }

  init() {
    this.rafflesService
      .get
      .raffles()
      .subscribe({
        next: raffles => this.activeRaffles = raffles
      });
  }

  onSecondBuyClick(raffle) {
    const { participant: { name, email, DNI, phone, participations }, endpoint } = raffle;

    if (name && email && DNI && phone && participations) {
      raffle.showAlert = false;
      this.rafflesService
        .post
        .mercadopago
        .pay(name, email, DNI, phone, endpoint, participations)
        .subscribe({
          next: ({ init_point }) => raffle.initPoint = init_point,
          error: ({ status }) => { if (status === 409) { raffle.showAlert = true; } }
        });
    } else {
      raffle.showAlert = true;
    }
  }

  findParticipations(DNI) {
    if (DNI) {
      this.rafflesService
        .get
        .participationsByDNI(DNI)
        .subscribe({
          next: participations => this.participations = participations,
        });
    }
  }

}
