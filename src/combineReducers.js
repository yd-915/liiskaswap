import { combineReducers } from 'redux';
import { ethereumReducer } from './services/ethereum/ethereumDuck';
import { refundReducer } from './services/refund/refundDuck';
import { reverseReducer } from './services/reverse/reverseDuck';
import { submarineReducer } from './services/submarine/submarineDuck';

export default combineReducers({
  refundReducer,
  reverseReducer,
  ethereumReducer,
  submarineReducer,
});
