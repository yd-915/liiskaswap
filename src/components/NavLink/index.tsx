import { createStyles, Link, LinkProps, makeStyles } from '@material-ui/core';
import React, { ReactElement } from 'react';

type NavLinkProps = LinkProps;

const useStyles = makeStyles(theme =>
  createStyles({
    navLink: {
      color: theme.palette.text.primary,
      fontSize: '1rem',
      letterSpacing: '0.67px',
    },
  })
);

const NavLink = (props: NavLinkProps): ReactElement => {
  const { ...linkProps } = props;
  const classes = useStyles();

  return (
    <Link
      className={classes.navLink}
      target='_blank'
      rel='noopener noreferrer'
      {...linkProps}
    />
  );
};

export default NavLink;
