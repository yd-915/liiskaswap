import { makeStyles } from '@material-ui/core/styles';
import { Popover } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  popover: {
    pointerEvents: 'none',
  },
  paper: {
    padding: theme.spacing(1),
  },
}));

const PopoverComponent = props => {
  const classes = useStyles();
  const { id, open, text, anchorEl, onCloseHandler } = props;
  return (
    <Popover
      id={id}
      className={classes.popover}
      classes={{
        paper: classes.paper,
      }}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      onClose={onCloseHandler}
      disableRestoreFocus
      disableScrollLock={true}
    >
      {text}
    </Popover>
  );
};

export default PopoverComponent;
