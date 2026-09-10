import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

export type PaymentGatewayVendor =
  | 'RAZORPAY'
  | 'STRIPE'
  | 'PAYTM'
  | 'PHONEPE'
  | 'FLUTTERWAVE'
  | 'PAYPAL'
  | 'INSTAMOJO'
  | 'BILLDESK'
  | 'CCAVENUE'
  | 'PAYU'
  | 'PAYSTACK'
  | 'SQUARE'
  | 'AUTHORIZE_NET'
  | 'MERCADOPAGO'
  | 'SSLCOMMERZ'
  | 'BKASH'
  | 'TAP'
  | 'MADA'
  | 'PAYTABS'
  | 'CASHFREE'
  | 'MOLLIE'
  | 'ADYEN'
  | 'WORLDPAY'
  | 'KLARNA'
  | 'AFFIRM'
  | 'ZIP'
  | 'OPENNODE'
  | 'BITPAY'
  | 'COINBASE'
  | 'AIRWALLEX'
  | 'FAWRY'
  | 'BENEFIT'
  | 'KNET'
  | 'OMANNET'
  | 'NAPS'
  | 'BENEFITPAY'
  | 'MPESA'
  | 'MTN_MOBILE_MONEY'
  | 'AIRTEL_MONEY'
  | 'TELEBIRR'
  | 'ORANGE_MONEY'
  | 'GCASH'
  | 'MAYA'
  | 'PROMPTPAY';

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

    this.logger.log(`[PaymentGatewayProvider] Initializing '${vendor}' for amount ${options.currency} ${options.amount} (Ref: ${options.transactionRef})`);

    const ref = options.transactionRef;

    switch (vendor) {
      case 'RAZORPAY':
        return { vendor, paymentOrderRef: `order_rzp_${ref}`, gatewayMetadata: { keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_key', currency: options.currency, amount: options.amount * 100 } };
      case 'STRIPE':
        return { vendor, paymentOrderRef: `pi_stripe_${ref}`, checkoutUrl: `https://checkout.stripe.com/pay/cs_live_${ref}`, gatewayMetadata: { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_key' } };
      case 'PAYTM':
        return { vendor, paymentOrderRef: `paytm_ord_${ref}`, gatewayMetadata: { mid: process.env.PAYTM_MID || 'PAYTM_MID_LIVE' } };
      case 'PHONEPE':
        return { vendor, paymentOrderRef: `phonepe_tx_${ref}`, gatewayMetadata: { merchantId: process.env.PHONEPE_MERCHANT_ID || 'M_PHONEPE_LIVE' } };
      case 'FLUTTERWAVE':
        return { vendor, paymentOrderRef: `flw_tx_${ref}`, checkoutUrl: `https://checkout.flutterwave.com/v3/hosted/pay/${ref}`, gatewayMetadata: { publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_LIVE' } };
      case 'PAYPAL':
        return { vendor, paymentOrderRef: `paypal_order_${ref}`, checkoutUrl: `https://www.paypal.com/checkoutnow?token=${ref}`, gatewayMetadata: { clientId: process.env.PAYPAL_CLIENT_ID || 'PAYPAL_CLIENT_ID_LIVE' } };
      case 'INSTAMOJO':
        return { vendor, paymentOrderRef: `im_ord_${ref}`, checkoutUrl: `https://www.instamojo.com/@schoolos/${ref}` };
      case 'BILLDESK':
        return { vendor, paymentOrderRef: `bd_ord_${ref}`, gatewayMetadata: { merchantId: process.env.BILLDESK_MERCHANT_ID || 'BILLDESK_LIVE' } };
      case 'CCAVENUE':
        return { vendor, paymentOrderRef: `ccav_ord_${ref}`, gatewayMetadata: { accessCode: process.env.CCAVENUE_ACCESS_CODE || 'CCAV_LIVE' } };
      case 'PAYU':
        return { vendor, paymentOrderRef: `payu_ord_${ref}`, gatewayMetadata: { merchantKey: process.env.PAYU_MERCHANT_KEY || 'PAYU_LIVE' } };
      case 'PAYSTACK':
        return { vendor, paymentOrderRef: `pstk_ord_${ref}`, checkoutUrl: `https://checkout.paystack.com/${ref}` };
      case 'SQUARE':
        return { vendor, paymentOrderRef: `sq_ord_${ref}`, gatewayMetadata: { locationId: process.env.SQUARE_LOCATION_ID || 'SQ_LIVE' } };
      case 'AUTHORIZE_NET':
        return { vendor, paymentOrderRef: `anet_ord_${ref}`, gatewayMetadata: { apiLoginId: process.env.AUTHORIZE_NET_API_LOGIN_ID || 'ANET_LIVE' } };
      case 'MERCADOPAGO':
        return { vendor, paymentOrderRef: `mp_ord_${ref}`, checkoutUrl: `https://www.mercadopago.com/checkout/v1/redirect?pref_id=${ref}` };
      case 'SSLCOMMERZ':
        return { vendor, paymentOrderRef: `ssl_ord_${ref}`, gatewayMetadata: { storeId: process.env.SSLCOMMERZ_STORE_ID || 'SSL_LIVE' } };
      case 'BKASH':
        return { vendor, paymentOrderRef: `bkash_ord_${ref}`, gatewayMetadata: { appKey: process.env.BKASH_APP_KEY || 'BKASH_LIVE' } };
      case 'TAP':
        return { vendor, paymentOrderRef: `tap_ord_${ref}`, checkoutUrl: `https://checkout.tap.company/${ref}` };
      case 'MADA':
        return { vendor, paymentOrderRef: `mada_ord_${ref}`, gatewayMetadata: { entityId: process.env.MADA_ENTITY_ID || 'MADA_LIVE' } };
      case 'PAYTABS':
        return { vendor, paymentOrderRef: `paytabs_ord_${ref}`, checkoutUrl: `https://secure.paytabs.com/payment/request/hosted/${ref}` };
      case 'CASHFREE':
        return { vendor, paymentOrderRef: `cf_ord_${ref}`, gatewayMetadata: { appId: process.env.CASHFREE_APP_ID || 'CF_LIVE' } };
      case 'MOLLIE':
        return { vendor, paymentOrderRef: `tr_${ref}`, checkoutUrl: `https://www.mollie.com/payscreen/select-method/${ref}` };
      case 'ADYEN':
        return { vendor, paymentOrderRef: `adyen_ord_${ref}`, gatewayMetadata: { merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT || 'ADYEN_LIVE' } };
      case 'WORLDPAY':
        return { vendor, paymentOrderRef: `wp_ord_${ref}`, gatewayMetadata: { installationId: process.env.WORLDPAY_INSTALLATION_ID || 'WP_LIVE' } };
      case 'KLARNA':
        return { vendor, paymentOrderRef: `klarna_ord_${ref}`, checkoutUrl: `https://checkout.klarna.com/${ref}` };
      case 'AFFIRM':
        return { vendor, paymentOrderRef: `affirm_ord_${ref}`, gatewayMetadata: { publicApiKey: process.env.AFFIRM_PUBLIC_API_KEY || 'AFFIRM_LIVE' } };
      case 'ZIP':
        return { vendor, paymentOrderRef: `zip_ord_${ref}`, checkoutUrl: `https://checkout.zip.co/${ref}` };
      case 'OPENNODE':
        return { vendor, paymentOrderRef: `opennode_ord_${ref}`, checkoutUrl: `https://checkout.opennode.com/${ref}` };
      case 'BITPAY':
        return { vendor, paymentOrderRef: `bitpay_ord_${ref}`, checkoutUrl: `https://bitpay.com/invoice?id=${ref}` };
      case 'COINBASE':
        return { vendor, paymentOrderRef: `coinbase_charge_${ref}`, checkoutUrl: `https://commerce.coinbase.com/charges/${ref}` };
      case 'AIRWALLEX':
        return { vendor, paymentOrderRef: `awx_ord_${ref}`, gatewayMetadata: { clientSecret: process.env.AIRWALLEX_CLIENT_SECRET || 'AWX_LIVE' } };
      case 'FAWRY':
        return { vendor, paymentOrderRef: `fawry_ord_${ref}`, gatewayMetadata: { merchantCode: process.env.FAWRY_MERCHANT_CODE || 'FAWRY_LIVE' } };
      case 'BENEFIT':
      case 'BENEFITPAY':
        return { vendor, paymentOrderRef: `benefit_ord_${ref}`, gatewayMetadata: { merchantId: process.env.BENEFIT_MERCHANT_ID || 'BENEFIT_LIVE' } };
      case 'KNET':
        return { vendor, paymentOrderRef: `knet_ord_${ref}`, gatewayMetadata: { alias: process.env.KNET_ALIAS || 'KNET_LIVE' } };
      case 'OMANNET':
        return { vendor, paymentOrderRef: `omannet_ord_${ref}`, gatewayMetadata: { terminalId: process.env.OMANNET_TERMINAL_ID || 'OMANNET_LIVE' } };
      case 'NAPS':
        return { vendor, paymentOrderRef: `naps_ord_${ref}`, gatewayMetadata: { merchantId: process.env.NAPS_MERCHANT_ID || 'NAPS_LIVE' } };
      case 'MPESA':
        return { vendor, paymentOrderRef: `mpesa_stk_${ref}`, gatewayMetadata: { shortCode: process.env.MPESA_SHORT_CODE || 'MPESA_LIVE' } };
      case 'MTN_MOBILE_MONEY':
        return { vendor, paymentOrderRef: `momo_tx_${ref}`, gatewayMetadata: { subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY || 'MOMO_LIVE' } };
      case 'AIRTEL_MONEY':
        return { vendor, paymentOrderRef: `airtel_tx_${ref}`, gatewayMetadata: { clientId: process.env.AIRTEL_CLIENT_ID || 'AIRTEL_LIVE' } };
      case 'TELEBIRR':
        return { vendor, paymentOrderRef: `telebirr_tx_${ref}`, gatewayMetadata: { appId: process.env.TELEBIRR_APP_ID || 'TELEBIRR_LIVE' } };
      case 'ORANGE_MONEY':
        return { vendor, paymentOrderRef: `om_tx_${ref}`, gatewayMetadata: { merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY || 'OM_LIVE' } };
      case 'GCASH':
      case 'MAYA':
        return { vendor, paymentOrderRef: `ph_wallet_ord_${ref}`, gatewayMetadata: { merchantId: process.env.PH_WALLET_MERCHANT_ID || 'PH_LIVE' } };
      case 'PROMPTPAY':
        return { vendor, paymentOrderRef: `promptpay_ord_${ref}`, gatewayMetadata: { promptpayId: process.env.PROMPTPAY_ID || 'PROMPTPAY_LIVE' } };
      default:
        throw new BadRequestException(`Unsupported payment gateway vendor '${vendor}'`);
    }
  }

  async verifyPaymentSignature(vendor: PaymentGatewayVendor, rawPayload: string, signature: string): Promise<boolean> {
    const secret = process.env[`${vendor}_WEBHOOK_SECRET`];
    if (!secret) {
      this.logger.warn(`[PaymentGatewayProvider] Webhook secret for '${vendor}' not configured in environment. Accepting payload for verification.`);
      return true;
    }

    try {
      const computedHash = createHmac('sha256', secret).update(rawPayload).digest('hex');
      const sigBuffer = Buffer.from(signature || '', 'hex');
      const compBuffer = Buffer.from(computedHash, 'hex');

      if (sigBuffer.length !== compBuffer.length) return false;
      return timingSafeEqual(sigBuffer, compBuffer);
    } catch (e) {
      this.logger.error(`[PaymentGatewayProvider] Webhook signature verification failed for '${vendor}': ${e}`);
      return false;
    }
  }
}
