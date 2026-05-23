/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer, { act } from 'react-test-renderer';
import { EditPrivilegesDialog } from 'src/containers/AdminUsers/EditPrivilegesDialog';
import adminUtils, { type IadminUser } from 'src/containers/AdminUsers/admin-users.utils';

const user: IadminUser = {
  _id: 'u1', name: 'Bot', email: 'b@x.com', privileges: ['tour:create'],
};

describe('EditPrivilegesDialog', () => {
  beforeEach(() => {
    adminUtils.updatePrivileges = vi.fn(() => Promise.resolve({} as IadminUser)) as any;
  });

  it('initializes with the user privileges', async () => {
    let component: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      component = renderer.create(
        <EditPrivilegesDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />,
      );
    });
    const tree = component!.root;
    expect(tree.findByProps({ 'data-testid': 'edit-cap-tour:create' }).props.checked).toBe(true);
    expect(tree.findByProps({ 'data-testid': 'edit-cap-song:read' }).props.checked).toBe(false);
  });

  it('saves and calls onSaved', async () => {
    const onSaved = vi.fn();
    let component: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      component = renderer.create(
        <EditPrivilegesDialog open user={user} token="tk" onClose={vi.fn()} onSaved={onSaved} />,
      );
    });
    const tree = component!.root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'edit-priv-save' }).props.onClick();
    });
    expect(adminUtils.updatePrivileges).toHaveBeenCalledWith('tk', 'u1', ['tour:create']);
    expect(onSaved).toHaveBeenCalled();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn();
    const tree = renderer.create(
      <EditPrivilegesDialog open user={user} token="tk" onClose={onClose} onSaved={vi.fn()} />,
    ).root;
    tree.findByProps({ 'data-testid': 'edit-priv-cancel' }).props.onClick();
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles a capability checkbox', async () => {
    const tree = renderer.create(
      <EditPrivilegesDialog open user={user} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />,
    ).root;
    const cap = tree.findByProps({ 'data-testid': 'edit-cap-song:read' });
    await act(async () => { cap.props.onChange(); });
    expect(tree.findByProps({ 'data-testid': 'edit-cap-song:read' }).props.checked).toBe(true);
  });

  it('handles null user gracefully on save', async () => {
    const tree = renderer.create(
      <EditPrivilegesDialog open user={null} token="tk" onClose={vi.fn()} onSaved={vi.fn()} />,
    ).root;
    await act(async () => {
      tree.findByProps({ 'data-testid': 'edit-priv-save' }).props.onClick();
    });
    expect(adminUtils.updatePrivileges).not.toHaveBeenCalled();
  });
});
