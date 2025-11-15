import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';

// Declare fbq for TypeScript
declare const fbq: any;

export interface FacebookEventData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
}

export interface FacebookUserData {
  client_ip_address?: string;
  client_user_agent: string;
  event_source_url: string;
  email?: string;
  phone?: string;
  fbc?: string; // Facebook Click ID (format: fb.1.{timestamp}.{fbclid})
  fbp?: string; // Facebook Browser ID (format: fb.1.{timestamp}.{random})
  fbclid?: string; // Raw fbclid from URL (for backend processing)
}

@Injectable({
  providedIn: 'root'
})
export class FacebookPixelService {
  private apiUrl = environment.apiUrl;
  private pixelId = environment.facebookPixelId;
  private readonly FBC_COOKIE_NAME = '_fbc';
  private readonly FBP_COOKIE_NAME = '_fbp';
  private readonly COOKIE_EXPIRY_DAYS = 90; // Meta recommendation: 90 days

  constructor(private http: HttpClient) {
    // Initialize Facebook parameters on service creation
    this.initializeFacebookParams();
  }

  /**
   * Initialize Facebook tracking parameters (fbc, fbp)
   * Called automatically on service creation
   */
  private initializeFacebookParams(): void {
    // Handle FBC (Facebook Click ID) from URL
    const fbclid = this.extractFbclidFromUrl();
    if (fbclid) {
      const existingFbc = this.getCookie(this.FBC_COOKIE_NAME);
      if (!existingFbc || !this.isValidFbc(existingFbc)) {
        const fbc = this.generateFbc(fbclid);
        this.setCookie(this.FBC_COOKIE_NAME, fbc, this.COOKIE_EXPIRY_DAYS);
        console.log('[FB Pixel] Generated and stored fbc:', fbc);
      }
    }

    // Handle FBP (Facebook Browser ID)
    const existingFbp = this.getCookie(this.FBP_COOKIE_NAME);
    if (!existingFbp || !this.isValidFbp(existingFbp)) {
      // Wait a bit for Facebook Pixel to set its own _fbp cookie
      setTimeout(() => {
        const pixelFbp = this.getCookie(this.FBP_COOKIE_NAME);
        if (!pixelFbp) {
          // Pixel didn't set fbp, generate our own
          const fbp = this.generateFbp();
          this.setCookie(this.FBP_COOKIE_NAME, fbp, this.COOKIE_EXPIRY_DAYS);
          console.log('[FB Pixel] Generated and stored fbp:', fbp);
        }
      }, 1000); // Wait 1 second for pixel to load
    }
  }

  /**
   * Cookie Management Helpers
   */
  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Extract fbclid from URL
   */
  private extractFbclidFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('fbclid');
  }

  /**
   * Generate FBC (Facebook Click ID) from fbclid
   * Format: fb.1.{timestamp}.{fbclid}
   */
  private generateFbc(fbclid: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    return `fb.1.${timestamp}.${fbclid}`;
  }

  /**
   * Generate FBP (Facebook Browser ID) as fallback
   * Format: fb.1.{timestamp}.{random}
   */
  private generateFbp(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.floor(Math.random() * 1000000000);
    return `fb.1.${timestamp}.${random}`;
  }

  /**
   * Validate FBC format (should be: fb.1.{timestamp}.{fbclid})
   */
  private isValidFbc(fbc: string): boolean {
    return /^fb\.1\.\d+\..+$/.test(fbc);
  }

  /**
   * Validate FBP format (should be: fb.1.{timestamp}.{random})
   */
  private isValidFbp(fbp: string): boolean {
    return /^fb\.1\.\d+\.\d+$/.test(fbp);
  }

  /**
   * Track event via Browser Pixel (fbq)
   */
  private trackBrowserPixel(event: string, data?: any) {
    if (typeof fbq !== 'undefined') {
      fbq('track', event, data);
      console.log(`[FB Pixel Browser] ${event}`, data);
    }
  }

  /**
   * Track event via Conversion API (server-side)
   */
  private async trackConversionAPI(
    event: string,
    eventData: FacebookEventData,
    userData?: Partial<FacebookUserData>
  ): Promise<void> {
    try {
      // Get current fbc and fbp from cookies
      const fbc = this.getCookie(this.FBC_COOKIE_NAME) || undefined;
      const fbp = this.getCookie(this.FBP_COOKIE_NAME) || undefined;
      const fbclid = this.extractFbclidFromUrl() || undefined;

      const fullUserData: FacebookUserData = {
        client_user_agent: navigator.userAgent,
        event_source_url: window.location.href,
        fbp,
        fbc,
        fbclid, // Send raw fbclid to backend for processing
        ...userData
      };

      // Check for test_event_code in URL (for Facebook Test Events)
      const urlParams = new URLSearchParams(window.location.search);
      const testEventCode = urlParams.get('test_event_code');

      const payload = {
        event,
        eventData,
        userData: fullUserData,
        ...(testEventCode && { test_event_code: testEventCode })
      };

      console.log('[FB Conversion API] Sending event with parameters:', {
        event,
        hasFbc: !!fbc,
        hasFbp: !!fbp,
        hasFbclid: !!fbclid,
        hasEmail: !!userData?.email
      });

      await firstValueFrom(
        this.http.post(`${this.apiUrl}/track`, payload)
      );

      console.log(`[FB Conversion API] ${event} sent successfully`);
    } catch (error) {
      console.error(`[FB Conversion API] Error tracking ${event}:`, error);
    }
  }

  /**
   * Track PageView (browser only, called automatically by pixel)
   */
  trackPageView() {
    // PageView is tracked automatically by the pixel in index.html
    console.log('[FB Pixel] PageView tracked automatically');
  }

  /**
   * Track ViewContent (browser + server)
   */
  async trackViewContent(contentData: FacebookEventData) {
    // Browser pixel
    this.trackBrowserPixel('ViewContent', contentData);

    // Conversion API
    await this.trackConversionAPI('ViewContent', contentData);
  }

  /**
   * Track Purchase (browser + server)
   */
  async trackPurchase(
    value: number,
    currency: string,
    contentIds: string[],
    contentName: string,
    email?: string
  ) {
    const eventData: FacebookEventData = {
      value,
      currency,
      content_ids: contentIds,
      content_name: contentName,
      content_type: 'product'
    };

    // Browser pixel
    this.trackBrowserPixel('Purchase', eventData);

    // Conversion API with email if provided
    await this.trackConversionAPI('Purchase', eventData, { email });
  }

}
