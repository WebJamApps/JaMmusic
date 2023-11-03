import renderer from 'react-test-renderer';
import { EditPicTable, columns } from 'src/containers/Music/Pictures/EditPicTable';

describe('EditPicTable and handles onRowClick', () => {
  it('handles click on Cancel button', () => {
    const setShowTable = jest.fn();
    const cancel = renderer.create(<EditPicTable setShowTable={setShowTable} />).root;
    cancel.findByProps({ className: 'cancelEditPicButton' }).props.onClick();
    expect(setShowTable).toHaveBeenCalledWith(false);
    cancel.findByProps({ className: 'rowParams' }).props.onRowClick({ row: {} });
  });
  it('renders url cell with url', () => {
    const url: any = columns[1];
    const params: any = { row: { url } };
    const cell: any = url.renderCell(params);
    const image = <img alt="url" src={url} style={{ width: '200px' }} />;
    expect(cell).toStrictEqual(image);
  });
  it('renders url cell when undefined', () => {
    const url: any = columns[1];
    const params: any = { row: { } };
    const cell: any = url.renderCell(params);
    expect(cell).toBe('');
  });
});
