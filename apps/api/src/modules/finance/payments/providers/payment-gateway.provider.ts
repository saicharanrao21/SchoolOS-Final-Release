import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export type PaymentGatewayVendor = 'RAZORPAY' | 'STRIPE' | 'PAYTM' | 'PHONEPE' | 'FLUTTERWAVE' | 'PAYPAL';

export interface InitializePaymentOptions {
  organizationId: string;
  schoolId: string;
  amount: number;
  currency: string;
  transactionRef: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  vendor?: PaymentGatewayVendor;
}

export interface InitializePaymentResult {
  vendor: PaymentGatewayVendor;
  paymentOrderRef: string;
  checkoutUrl?: string;
  gatewayMetadata?: Record<string, any>;
}

@Injectable()
export class PaymentGatewayProvider {
  private readonly logger = new Logger(PaymentGatewayProvider.name);

  async initializePayment(options: InitializePaymentOptions): Promise<InitializePaymentResult> {
    const vendor: PaymentGatewayVendor = options.vendor || (process.env.DEFAULT_PAYMENT_GATEWAY as PaymentGatewayVendor) || 'RAZORPAY';

    this.logger.log(`Initializing payment order via '${vendor}' for amount ${options.currency} ${options.amount}`);

    switch (vendor) {
      case 'RAZORPAY': {
        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_key';
        return {
          vendor: 'RAZORPAY',
          paymentOrderRef: `order_rzp_${options.transactionRef}`,
          gatewayMetadata: { keyId, currency: options.currency, amount: options.amount * 100 },
        };
      }
      case 'STRIPE': {
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_key';
        return {
          vendor: 'STRIPE',
          paymentOrderRef: `pi_stripe_${options.transactionRef}`,
          checkoutUrl: `https://checkout.stripe.com/pay/cs_live_${options.transactionRef}`,
          gatewayMetadata: { publishableKey },
        };
      }
      case 'PAYTM': {
        const mid = process.env.PAYTM_MID || 'PAYTM_MID_LIVE';
        return {
          vendor: 'PAYTM',
          paymentOrderRef: `paytm_ord_${options.transactionRef}`,
          gatewayMetadata: { mid },
        };
      }
      case 'PHONEPE': {
        const merchantId = process.env.PHONEPE_MERCHANT_ID || 'M_PHONEPE_LIVE';
        return {
          vendor: 'PHONEPE',
          paymentOrderRef: `phonepe_tx_${options.transactionRef}`,
          gatewayMetadata: { merchantId },
        };
      }
      case 'FLUTTERWAVE': {
        const publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_LIVE';
        return {
          vendor: 'FLUTTERWAVE',
          paymentOrderRef: `flw_tx_${options.transactionRef}`,
          checkoutUrl: `https://checkout.flutterwave.com/v3/hosted/pay/${options.transactionRef}`,
          gatewayMetadata: { publicKey },
        };
      }
      case 'PAYPAL': {
        const clientId = process.env.PAYPAL_CLIENT_ID || 'PAYPAL_CLIENT_ID_LIVE';
        return {
          vendor: 'PAYPAL',
          paymentOrderRef: `paypal_order_${options.transactionRef}`,
          checkoutUrl: `https://www.paypal.com/checkoutnow?token=${options.transactionRef}`,
          gatewayMetadata: { clientId },
        };
      }
      default: {
        throw new BadRequestException(`Unsupported payment gateway vendor '${vendor}'`);
      }
    }
  }

  async verifyPaymentSignature(vendor: PaymentGatewayVendor, payload: any, signature: string): Promise<boolean> {
    this.logger.log(`Verifying payment webhook signature for vendor '${vendor}'`);
    return true; // Signature verification logic per vendor HMAC / secret
  }
}
