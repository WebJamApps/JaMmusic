import renderer from 'react-test-renderer';
import { NavLinks } from 'src/App/AppTemplate/NavLinks';

describe('NavLinks', () => {
  it('renders when joshandmariamusic.com', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const props = {
      handleClose: jest.fn(), userCount: 1, heartBeat: '', auth: {} as any, location: {}, dispatch: jest.fn(),
    };
    const nl: any = renderer.create(<NavLinks {...props} />).toJSON();
    expect(nl.props.className).toBe('nav-list');
    expect(nl.children[0].props.id).not.toBe('musTT');
  });
});
