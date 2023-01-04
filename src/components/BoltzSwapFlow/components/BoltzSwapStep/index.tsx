import { createStyles, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { ReactElement } from 'react';
import Button from '../../../Button';
import ErrorMessage from '../../../ErrorMessage';

type BoltzSwapStepProps = {
  content: ReactElement;
  title: string | ReactElement;
  errorMessage?: string;
  mainButtonText?: string;
  mainButtonVisible?: boolean;
  mainButtonDisabled?: boolean;
  mainButtonLoading?: boolean;
  onMainButtonClick?: (event?: any) => void;
};

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      padding: '2rem',
      flex: 1,
      justifyContent: 'space-between',
    },
    title: {
      marginBottom: '1rem',
      fontSize: '1.5rem',
      lineHeight: 'normal',
      letterSpacing: '1px',
      width: '100%',
    },
    errorMessage: {
      marginBottom: '1rem',
    },
  })
);

const BoltzSwapStep = (props: BoltzSwapStepProps): ReactElement => {
  const classes = useStyles();
  const {
    content,
    title,
    errorMessage,
    mainButtonText,
    mainButtonVisible,
    mainButtonDisabled,
    mainButtonLoading,
    onMainButtonClick,
  } = props;

  return (
    <>
      <Grid
        container
        className={classes.content}
        justify='flex-start'
        direction='column'
        alignItems='center'
      >
        <Typography className={classes.title} component='h2' align='center'>
          {title}
        </Typography>
        {content}
        <span />
      </Grid>
      {!!errorMessage && (
        <ErrorMessage message={errorMessage} className={classes.errorMessage} />
      )}
      {mainButtonVisible && (
        <Button
          fullWidth
          variant='contained'
          color='primary'
          loading={mainButtonLoading}
          disabled={mainButtonDisabled || mainButtonLoading}
          onClick={onMainButtonClick}
        >
          {mainButtonText}
        </Button>
      )}
    </>
  );
};

export default BoltzSwapStep;
