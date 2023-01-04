export const defaultBackground = '#1F1645'; 
export const defaultBackgroundLight = '#674C4C';
export const primaryTextColor = '#f2f2f2'; // whiteish
export const ternaryTextColor = '#636363';

export const theme = {
  typography: {
    fontFamily: '"ApercuProMedium", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    type: 'dark',
    text: {
      primary: primaryTextColor,
      secondary: '#979797',
    },
    background: {
      default: defaultBackground,
      paper: defaultBackgroundLight,
    },
    primary: {
      main: '#f15a24', // orange
      contrastText: '#0c0c0c',
    },
    secondary: {
      main: '#f2f2f2', // whiteish
    },
  },
};
