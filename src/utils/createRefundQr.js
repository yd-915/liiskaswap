import QRious from 'qrious';

export default jsonData => {
  const qr = new QRious({
    size: 500,
    level: 'L',
    value: jsonData,
    background: 'white',
    foreground: 'black',
    backgroundAlpha: 1,
    foregroundAlpha: 1,
  });

  return qr.toDataURL();
};
