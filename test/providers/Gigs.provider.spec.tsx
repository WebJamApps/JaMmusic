
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import { GigsProvider } from '../../src/providers/Gigs.provider';
import fetchGigs from '../../src/providers/fetchGigs';

describe('the gigs provider', () => {
  let container: ReactDOM.Container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('GigsProvider is defined', () => {
    fetchGigs.getGigs = jest.fn();
    act(() => { ReactDOM.render(<GigsProvider><div id="gigs"/></GigsProvider>, container); });
    expect(document.getElementById('gigs')).toBeDefined();
  });
});
