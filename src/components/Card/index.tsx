import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
  root: {
    // height: 600,
    borderRadius: '0.1rem',
  },
  content: {
    padding: 0,
    height: '100%',
    '&:last-child': {
      'padding-bottom': 0,
    },
  },
  card: {
    flex: 1,
    margin: '2rem 0',
  },
});

const CardComponent = ({ children }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction='column'
      alignItems='center'
      className={classes.card}
    >
      <Grid item container justify='center'>
        <Grid item xs={11} sm={9} md={6} lg={4} xl={3}>
          <Card className={classes.root}>
            <CardContent className={classes.content}>{children}</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CardComponent;
