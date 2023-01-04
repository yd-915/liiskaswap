import Destination from '../views/reverse/destination';
import Send from '../views/reverse/send';
import Status from '../views/reverse/status';

export const ReverseSteps = [
  {
    key: 0,
    label: 'Choose',
    component: () => null,
  },
  {
    key: 1,
    label: 'Destination',
    component: Destination,
  },
  {
    key: 2,
    label: 'Send',
    component: Send,
  },
  {
    key: 3,
    label: 'Status',
    component: Status,
  },
];

export const getSelectedOption = (options, value) => {
  return options.filter(option => option.value === value)[0];
};
