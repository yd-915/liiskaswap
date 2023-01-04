import { isInvoiceValid } from '../../../services/submarine/invoiceValidation';

describe('invoiceValidation', () => {
  const testInvoice =
    'lnbcrt1p0nss5kpp53alrsq9s9j0d7e62w47kpfcgfegjxjq4wvvxuctyxzsmgu9lu7lqdqqcqzpgsp506my65ea47e362emrv3nzp8xnrajmp098h765w5we7amynk5ssss9qy9qsqy82dgne63myrk6per7m4jwapal58stl0dmuekk630sm58n7sfc7kf7h5lj88swx7m55jm3h2n6x2fyvdjgzjt2tglnqnmp57g834klsq0ddrhr';

  test('should return true for valid invoices', () => {
    expect(isInvoiceValid(testInvoice)).toEqual(true);
  });

  test('should return false for invalid invoices', () => {
    expect(isInvoiceValid('asdf')).toEqual(false);
  });
});
