import BigNumber from 'bignumber.js';
import CurrencyID from '../../constants/currency';
import { AmountPreview, CurrencyAmount, CurrencyPair, RatesFetcher } from '../../constants/rates';
import { Quote } from './Asb';
import { BitcoinAmount } from './BitcoinAmount';
import { MoneroAmount } from './MoneroAmount';

export class XmrBtcRateFetcher implements RatesFetcher {
  constructor(private latestQuote: Quote | null, private error: Error | null) {}

  previewGivenSend(
    amountWithCurrency: CurrencyAmount,
    pair: CurrencyPair,
  ): Promise<AmountPreview> {
    this.ensureNoRefreshErrors();
    let send = BitcoinAmount.fromBtc(amountWithCurrency.amount.toString());
    let price = this.getQuote().price;
    let receive = receiveAmountForSendAmount(send, price);

    let amount = new BigNumber(receive.asXmr().toString());

    return Promise.resolve({
      amountWithFees: {
        amount: amount,
        currency: CurrencyID.MONERO,
      },
    });
  }

  previewGivenReceive(
    amountWithCurrency: CurrencyAmount,
    pair: CurrencyPair,
  ): Promise<AmountPreview> {
    this.ensureNoRefreshErrors();
    let receive_xmr = MoneroAmount.fromXmr(
      amountWithCurrency.amount.toString(),
    );

    let send_btc = BitcoinAmount.fromBtcRateAndAmount(
      this.getQuote().price,
      receive_xmr,
    );

    let amount = new BigNumber(send_btc.asBtc().toString());

    return Promise.resolve({
      amountWithFees: {
        amount: amount,
        currency: CurrencyID.BTC,
      },
    });
  }

  isPairSupported(pair: CurrencyPair): boolean {
    return pair[0] === CurrencyID.BTC && pair[1] === CurrencyID.MONERO;
  }

  maxQuantity(): BitcoinAmount {
    return this.getQuote().max_quantity;
  }

  updateError(error: Error | null) {
    this.error = error;
    this.latestQuote = null;
  }

  updateQuote(quote: Quote) {
    this.latestQuote = quote;
    this.error = null;
  }

  private ensureNoRefreshErrors() {
    if (this.error) {
      throw this.error;
    }
  }

  private getQuote(): Quote {
    if (!this.latestQuote) {
      throw new Error('Quote not available');
    }

    return this.latestQuote;
  }
}

export function receiveAmountForSendAmount(
  send: BitcoinAmount,
  price: BitcoinAmount,
): MoneroAmount {
  let receive = MoneroAmount.fromBtcRateAndAmount(price, send);

  return receive;
}
