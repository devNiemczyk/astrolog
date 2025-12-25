import { Component, signal, OnInit, OnDestroy, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FacebookPixelService } from '../../services/facebook-pixel.service';

@Component({
  selector: 'app-vsl-no-form',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './vsl-no-form.component.html',
  styleUrl: './vsl-no-form.component.scss'
})
export class VslNoFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private carouselInterval: any;
  private gridCarouselInterval: any;
  private countdownInterval: any;
  private liveViewersInterval: any;

  // FOMO Signals
  hours = signal('23');
  minutes = signal('45');
  seconds = signal('12');
  liveViewers = signal(7);
  spotsLeft = signal(3);
  recentOrders = signal(12);

  // Modal state
  isModalOpen = signal(false);

  // FOMO Notifications
  notifications = signal<Array<{id: number, name: string, product: string, visible: boolean}>>([]);
  private notificationInterval: any;
  private notificationCounter = 0;

  private polishNames = [
    'Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Krystyna', 'Barbara',
    'Ewa', 'Elżbieta', 'Zofia', 'Joanna', 'Magdalena', 'Monika', 'Danuta', 'Irena',
    'Halina', 'Helena', 'Beata', 'Aleksandra', 'Dorota', 'Renata', 'Iwona', 'Teresa',
    'Paulina', 'Natalia', 'Karolina', 'Weronika', 'Justyna', 'Marta', 'Julia'
  ];

  private productNames = [
    'Życie Miłosne + Prognoza',
    'Finanse, Praca, Biznes + Prognoza',
    'Pełnia Życia + Prognoza',
    'Analiza Dopasowania + Prognoza'
  ];

  // Countdown target: 24 hours from now
  private countdownTarget = new Date().getTime() + (24 * 60 * 60 * 1000);

  // Testimonials data - carousel (Updated with new testimonials)
  testimonials = signal([
    {
      id: 1,
      avatar: 'assets/images/testimonials/10.png'
    },
    {
      id: 2,
      avatar: 'assets/images/testimonials/11.png'
    },
    {
      id: 3,
      avatar: 'assets/images/testimonials/12.png'
    },
    {
      id: 4,
      avatar: 'assets/images/testimonials/13.png'
    },
    {
      id: 5,
      avatar: 'assets/images/testimonials/14.png'
    },
    {
      id: 6,
      avatar: 'assets/images/testimonials/15.png'
    },
    {
      id: 7,
      avatar: 'assets/images/testimonials/16.png'
    },
    {
      id: 8,
      avatar: 'assets/images/testimonials/17.png'
    }
  ]);

  // Process steps
  processSteps = signal([
    {
      step: 1,
      icon: 'assets/images/icons/calendar.svg',
      title: 'Twoje dane urodzeniowe',
      description: 'Podajesz <strong>dokładną datę</strong>, godzinę i <strong>miejsce urodzenia</strong>'
    },
    {
      step: 2,
      icon: 'assets/images/icons/chart.svg',
      title: 'Precyzyjna analiza astrologiczna',
      description: 'Tworzymy <strong>szczegółowy wykres astrologiczny</strong> z planetami i aspektami'
    },
    {
      step: 3,
      icon: 'assets/images/icons/document.svg',
      title: '25-50 stron spersonalizowanego raportu',
      description: 'Otrzymujesz <strong>pełną analizę</strong> swojej linii miłości i <strong>przyszłych szans</strong>'
    },
    {
      step: 4,
      icon: 'assets/images/icons/chat.svg',
      title: 'Konsultacja Q&A',
      description: 'Możesz zadać <strong>dodatkowe pytania</strong> i uzyskać wyjaśnienia'
    }
  ]);

  // Offer items
  offerItems = signal([
    'Spersonalizowany raport PDF (25-50 stron)',
    'Dostęp do konsultacji Q&A',
    '3 konkretne daty kluczowych momentów',
    'Analiza linii miłości',
    'Twoje mocne strony w relacjach',
    'Blokady do przepracowania',
    'Wskazówki jak przyciągnąć właściwą osobę'
  ]);

  // Additional testimonials for grid (Updated with new OP testimonials)
  gridTestimonials = signal([
    {
      id: 9,
      avatar: 'assets/images/testimonials/OP.png'
    },
    {
      id: 10,
      avatar: 'assets/images/testimonials/OP (2).png'
    },
    {
      id: 11,
      avatar: 'assets/images/testimonials/OP (3).png'
    },
    {
      id: 12,
      avatar: 'assets/images/testimonials/OP (4).png'
    }
  ]);

  ngOnInit() {
    // Start FOMO features
    this.startCountdown();
    this.startLiveViewersSimulation();
    this.randomizeInitialValues();
    this.startNotifications();
  }

  ngAfterViewInit() {
    // Start auto-scroll po wyrenderowaniu widoku
    setTimeout(() => {
      this.startCarouselAutoScroll();
      this.startGridCarouselAutoScroll();
    }, 1000);
  }

  ngOnDestroy() {
    // Cleanup intervalów
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    if (this.gridCarouselInterval) {
      clearInterval(this.gridCarouselInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.liveViewersInterval) {
      clearInterval(this.liveViewersInterval);
    }
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  private randomizeInitialValues() {
    // Randomize spots left (2-5)
    this.spotsLeft.set(Math.floor(Math.random() * 4) + 2);

    // Randomize live viewers (5-12)
    this.liveViewers.set(Math.floor(Math.random() * 8) + 5);

    // Randomize recent orders (8-15)
    this.recentOrders.set(Math.floor(Math.random() * 8) + 8);
  }

  private startCountdown() {
    this.updateCountdown(); // Initial update

    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown() {
    const now = new Date().getTime();
    const distance = this.countdownTarget - now;

    if (distance < 0) {
      // Reset to 24 hours when countdown ends
      this.countdownTarget = new Date().getTime() + (24 * 60 * 60 * 1000);
      return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.hours.set(hours.toString().padStart(2, '0'));
    this.minutes.set(minutes.toString().padStart(2, '0'));
    this.seconds.set(seconds.toString().padStart(2, '0'));
  }

  private startLiveViewersSimulation() {
    // Update live viewers every 10-30 seconds
    this.liveViewersInterval = setInterval(() => {
      const change = Math.random() > 0.5 ? 1 : -1;
      const current = this.liveViewers();
      const newValue = Math.max(3, Math.min(15, current + change)); // Keep between 3-15
      this.liveViewers.set(newValue);

      // Occasionally update spots left (decrease only)
      if (Math.random() > 0.85 && this.spotsLeft() > 1) {
        this.spotsLeft.update(val => Math.max(1, val - 1));
      }

      // Occasionally update recent orders (increase only)
      if (Math.random() > 0.9 && this.recentOrders() < 20) {
        this.recentOrders.update(val => val + 1);
      }
    }, 15000); // Every 15 seconds
  }

  private startCarouselAutoScroll() {
    this.carouselInterval = setInterval(() => {
      const wrapper = document.querySelector('.carousel-wrapper') as HTMLElement;
      if (wrapper) {
        const card = wrapper.querySelector('.carousel-card') as HTMLElement;
        if (card) {
          const cardWidth = card.offsetWidth;
          const gap = 20;
          const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

          // Jeśli jesteśmy na końcu, wróć na początek
          if (wrapper.scrollLeft >= maxScroll - 10) {
            wrapper.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Przesuń o jedną kartę (scroll-snap automatycznie wycentruje)
            wrapper.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
          }
        }
      }
    }, 4000);
  }

  private startGridCarouselAutoScroll() {
    this.gridCarouselInterval = setInterval(() => {
      const wrapper = document.querySelector('.testimonials-grid-carousel-wrapper') as HTMLElement;
      if (wrapper) {
        const card = wrapper.querySelector('.grid-carousel-card') as HTMLElement;
        if (card) {
          const cardWidth = card.offsetWidth;
          const gap = 20;
          const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

          // Jeśli jesteśmy na końcu, wróć na początek
          if (wrapper.scrollLeft >= maxScroll - 10) {
            wrapper.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Przesuń o jedną kartę (scroll-snap automatycznie wycentruje)
            wrapper.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
          }
        }
      }
    }, 4000);
  }

  constructor(private fbPixel: FacebookPixelService) {}

  // Stripe payment links
  private stripeLinks = {
    love: {
      '12m': 'https://buy.stripe.com/aEU5mzcz11lcbDOfZ9',
      '5y': 'https://buy.stripe.com/5kA9CP7eH7JAfU4eV4'
    },
    finance: {
      '12m': 'https://buy.stripe.com/00g7uH56z3tk7ny00e',
      '5y': 'https://buy.stripe.com/8wM9CPbuX0h8eQ07sH'
    },
    full: {
      '12m': 'https://buy.stripe.com/14kcP11Un9RIcHScMY',
      '5y': 'https://buy.stripe.com/dR66qD6aDd3U23e9AN'
    },
    compatibility: {
      '12m': 'https://buy.stripe.com/00w4gz4B44bAef23HJ8IU0P',
      '5y': 'https://buy.stripe.com/eVqcN53x04bA6MA2DF8IU0Q'
    }
  };

  openStripeLink(product: 'love' | 'finance' | 'full' | 'compatibility', period: '12m' | '5y') {
    const link = this.stripeLinks[product][period];
    if (link) {
      window.open(link, '_blank');
    }
  }

  async handleCTA() {
    // Track ViewContent event (browser + Conversion API)
    await this.fbPixel.trackViewContent({
      content_name: 'Prognozy Astrologiczne',
      content_type: 'product_group'
    });

    // Open modal to choose forecast type
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  selectForecast(product: 'love' | 'finance' | 'full' | 'compatibility') {
    // Close modal and scroll to pricing section
    this.closeModal();
    setTimeout(() => {
      const pricingSection = document.querySelector('.pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Helper method for image fallback
  onImageError(event: Event, fallbackInitial: string) {
    const img = event.target as HTMLImageElement;
    img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23EC4899'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='32' font-family='Arial'%3E${fallbackInitial}%3C/text%3E%3C/svg%3E`;
  }

  // FOMO Notifications
  private startNotifications() {
    // Show first notification after 10 seconds
    setTimeout(() => {
      this.showNotification();
    }, 10000);

    // Then show every 20-40 seconds
    this.notificationInterval = setInterval(() => {
      this.showNotification();
    }, Math.random() * 20000 + 20000); // Random between 20-40 seconds
  }

  private showNotification() {
    const randomName = this.polishNames[Math.floor(Math.random() * this.polishNames.length)];
    const randomProduct = this.productNames[Math.floor(Math.random() * this.productNames.length)];

    const notification = {
      id: this.notificationCounter++,
      name: randomName,
      product: randomProduct,
      visible: true
    };

    // Add notification
    this.notifications.update(current => [...current, notification]);

    // Remove after 5 seconds
    setTimeout(() => {
      this.notifications.update(current =>
        current.map(n => n.id === notification.id ? {...n, visible: false} : n)
      );

      // Remove from array after animation
      setTimeout(() => {
        this.notifications.update(current =>
          current.filter(n => n.id !== notification.id)
        );
      }, 500);
    }, 5000);
  }
}
