import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';    // <--- importa CommonModule
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,           // si usás standalone components
  imports: [CommonModule, HttpClientModule],  // <--- importa acá NgIf y HttpClient
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  stripe!: Stripe | null;
  card!: StripeCardElement;
  cardErrors: string = '';
  loading = false;
  productId = 'product1';

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.stripe = await loadStripe('INTRODUCE_YOUR_PUBLIC_STRIPE_KEY_HERE');

    const elements = this.stripe!.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');

    this.card.on('change', (event) => {
      this.cardErrors = event.error ? event.error.message! : '';
    });
  }

  async pay() {
    if (!this.stripe) return;

    this.loading = true;

    const { token, error } = await this.stripe.createToken(this.card);

    if (error) {
      this.cardErrors = error.message!;
      this.loading = false;
      return;
    }

    this.http
      .post('http://localhost:3000/purchase', {
        tokenId: token!.id,
        productId: this.productId,
      })
      .subscribe({
        next: (res: any) => {
          alert('Pago exitoso! 🎉');
          this.loading = false;
        },
        error: (err) => {
          alert('Error: ' + err.error.error);
          this.loading = false;
        },
      });
  }
}
