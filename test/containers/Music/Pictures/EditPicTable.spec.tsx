import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditPicTable, columns } from 'src/containers/Music/Pictures/EditPicTable';

describe('EditPicTable and handles onRowClick', () => {
  it('handles click on Cancel button', () => {
    const setShowTable = vi.fn();
    const { container } = render(<EditPicTable setShowTable={setShowTable} />);
    fireEvent.click(container.querySelector('.cancelEditPicButton')!);
    expect(setShowTable).toHaveBeenCalledWith(false);
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
    const params: any = { row: {} };
    const cell: any = url.renderCell(params);
    expect(cell).toBe('');
  });
});
