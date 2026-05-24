import { render } from '@testing-library/react';
import { NavLinks } from 'src/App/AppTemplate/NavLinks';
import { BrowserRouter } from 'react-router-dom';

describe('NavLinks', () => {
  it('renders when joshandmariamusic.com', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const props = {
      handleClose: vi.fn(), userCount: 1, heartBeat: '',
    };
    const { container } = render(
      <BrowserRouter>
        <NavLinks {...props} />
      </BrowserRouter>
    );
    expect(container.querySelector('.nav-list')).toBeInTheDocument();
    expect(container.querySelector('#musTT')).toBeNull();
  });
});
