import React from 'react';
import QrReader from 'react-qr-reader';
import DialogBox from '../DialogBox';

export default function QrCodeReader(props) {
  const { onClose, open, setOpen } = props;

  if (open) {
    if (navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then(() => {})
        .catch(err =>
          alert(
            'The following error occurred when trying to access the camera: '
              + err,
          )
        );
    } else {
      alert('Sorry, browser does not support camera access');
    }
  }

  const closeDialogBox = () => {
    setOpen(false);
  };

  const onScan = value => {
    if (value && value.trim()) {
      onClose(value);
      closeDialogBox();
    }
  };

  return (
    <DialogBox open={open} onClose={closeDialogBox} title='Scan QR Code'>
      <QrReader
        delay={300}
        onError={console.error}
        onScan={onScan}
        style={{ width: '100%' }}
      />
    </DialogBox>
  );
}
