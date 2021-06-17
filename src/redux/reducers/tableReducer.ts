const initialState = {
  showTable: true,
};

const reducer = (state = initialState, action: { type: string; showTable: boolean; }): { showTable: boolean } => {
  switch (action.type) {
    case 'SHOW_TABLE':
      return {
        ...state,
        showTable: action.showTable,
      };
    default:
      return state;
  }
};

export default reducer;
