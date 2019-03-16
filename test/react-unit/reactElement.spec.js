
import { HelloWorld } from '../../src/components/react-element';

describe('++ react Element tests', () => {
  let rc;

  beforeEach(() => {
    rc = new HelloWorld();
  });

  it('should bind the component', (done) => {
    document.body.innerHTML = '<div id="renderer"></div>';
    rc.element = document.getElementById('renderer');
    rc.bind();
    done();
  });
});
