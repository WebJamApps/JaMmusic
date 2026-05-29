const initialState = {
  showTable: true,
};
// eslint-disable-next-line @typescript-eslint/default-param-last
const reducer = (state = initialState, action: any): { showTable: boolean } => {
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
