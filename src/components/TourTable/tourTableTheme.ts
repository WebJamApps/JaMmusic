import { createMuiTheme } from '@material-ui/core/styles';

export default (createMuiTheme as any)({

  typography: { useNextVariants: true },
  overrides: {
    MUIDataTableHeadCell: {
      root: {
        padding: '4px', fontWeight: 'bold', color: 'black', fontSize: '11pt',
      },
    },
    MuiTableRow: { head: { height: '40px' } },
    MuiTableCell: { root: { padding: '4px' } },
    MUIDataTableToolbar: {
      actions: { display: 'none' },
      root: { paddingLeft: 0, minHeight: 'inherit' },
    },
    MUIDataTable: { responsiveScroll: { maxHeight: '4.3in' } },
    MuiTypography: {
      h6: { color: 'black', fontWeight: 'bold', fontStyle: 'italic' },
    },
  },
});
