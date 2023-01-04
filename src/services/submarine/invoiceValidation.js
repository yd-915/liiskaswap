import bolt11 from '@boltz/bolt11';

export const isInvoiceValid = invoice => {
  try {
    bolt11.decode(invoice);
    return true;
  } catch (error) {
    return false;
  }
};
