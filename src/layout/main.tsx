import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Box, Grid } from '@material-ui/core';
import { default as React, ReactNode } from 'react';
import Background from '../components/Background';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

const useStyles = makeStyles(() =>
  createStyles({
    box: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      display: 'flex',
      flex: 1,
      justifyContent: 'center',
    },
  })
);

export type DefaultLayoutProps = {
  children: ReactNode;
};

const DefaultLayout = (props: DefaultLayoutProps) => {
  const classes = useStyles();

  return (
    <Background>
      <Box className={classes.box}>
        <NavBar />
        <Grid item className={classes.content}>
          {props.children}
        </Grid>
        <Footer />
      </Box>
    </Background>
  );
};

export default DefaultLayout;
