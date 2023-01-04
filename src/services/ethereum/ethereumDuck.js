const SET_SIGNER = 'SET_SIGNER';

const initialState = {
  signer: undefined,
};

/* Action creators */
export const setSigner = data => ({
  data,
  type: SET_SIGNER,
});

/* Reducers */
export const ethereumReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SIGNER:
      return {
        ...state,
        signer: action.data,
      };

    default:
      return state;
  }
};
