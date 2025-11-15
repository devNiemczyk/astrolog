import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacebookPixelService } from '../../services/facebook-pixel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss'
})
export class PaymentSuccess implements OnInit {
  productName = '';
  price = 0;

  // Product mapping
  private products: any = {
    'love-12m': { name: 'Życie Miłosne - 12 miesięcy', price: 329 },
    'love-5y': { name: 'Życie Miłosne - 5 lat', price: 429 },
    'finance-12m': { name: 'Finanse, Praca, Biznes - 12 miesięcy', price: 329 },
    'finance-5y': { name: 'Finanse, Praca, Biznes - 5 lat', price: 429 },
    'full-12m': { name: 'Pełnia Życia - 12 miesięcy', price: 329 },
    'full-5y': { name: 'Pełnia Życia - 5 lat', price: 429 },
    'compatibility-12m': { name: 'Analiza Dopasowania - 12 miesięcy', price: 329 },
    'compatibility-5y': { name: 'Analiza Dopasowania - 5 lat', price: 429 }
  };

  constructor(
    private route: ActivatedRoute,
    private fbPixel: FacebookPixelService
  ) {}

  ngOnInit() {
    // Get product from URL params
    this.route.queryParams.subscribe(params => {
      const productId = params['product'];
      const email = params['email']; // Optional from Stripe

      if (productId && this.products[productId]) {
        const product = this.products[productId];
        this.productName = product.name;
        this.price = product.price;

        // Track Purchase event (browser + Conversion API)
        this.trackPurchase(productId, product.name, product.price, email);
      }
    });
  }

  private async trackPurchase(
    productId: string,
    productName: string,
    price: number,
    email?: string
  ) {
    await this.fbPixel.trackPurchase(
      price,
      'PLN',
      [productId],
      productName,
      email
    );

    console.log(`[Payment Success] Purchase tracked:`, {
      productId,
      productName,
      price,
      email: email ? 'provided' : 'not provided'
    });
  }
}
