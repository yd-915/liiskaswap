import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import PropTypes from 'prop-types';
import React from 'react';
import svgIcons from '../../utils/svgIcons';

function SimpleDialog(props) {
  const { onClose, open, title } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      onClose={handleClose}
      aria-labelledby='simple-dialog-title'
      open={open}
    >
      <DialogTitle id='simple-dialog-title'>
        {title}
        <Button
          aria-controls={'menu-list-grow'}
          aria-haspopup='true'
          className='drawer-close-btn'
          onClick={handleClose}
        >
          <img src={svgIcons.close} alt='' />
        </Button>
      </DialogTitle>
      {props.children}
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

export default SimpleDialog;
