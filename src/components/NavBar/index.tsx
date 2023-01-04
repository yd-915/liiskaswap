import { createStyles, makeStyles } from '@material-ui/core/styles';
import { AppBar, Grid, isWidthUp, Toolbar, WithWidth, withWidth } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { ROUTES } from '../../pages/home';
import Logo from "../../assets/images/swap.png"
import Divider from '../Divider';
import Menu from '../Menu';


const useStyles = makeStyles(() =>
  createStyles({
    toolbar: {
      flexWrap: 'wrap',
    },
  })
);

export type NavBarProps = WithWidth & {};

const NavBar = (props: NavBarProps) => {
  const classes = useStyles();
  const { width } = props;
  const history = useHistory();
  const onLogoClick = () => {
    history.push(ROUTES.HOME);
  };

  return (
    <div>
      <AppBar elevation={0} color='transparent' position='static'>
        <Toolbar classes={{ root: classes.toolbar }}>
          <Grid
            justify='space-between'
            container
            direction={isWidthUp('sm', width) ? 'row' : 'row-reverse'}
            alignItems='center'
          >
            <img
             src={Logo}
             height={"200px"}
             width={"400px"}
            alt=''
            onClick={onLogoClick} />
            <Grid item>
              <Menu />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Divider />
    </div>
  );
};

export default withWidth()(NavBar);
