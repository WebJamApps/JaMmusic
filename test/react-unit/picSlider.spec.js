import React from 'react';
import { shallow } from 'enzyme';
import { PicSlider } from '../../src/components/pic-slider';


<<<<<<< HEAD
test('picture slider component test setup', () => {
  const ps = shallow(<PicSlider data={[]} caption="this is it" />);
=======
  beforeEach(() => {
    document.body.innerHTML = '<div id="renderer" class="swipe-area"></div>';
    ps = new PicSlider();
    console.log(ps);//eslint-disable-line no-console
    ps.data = [
      '../static/imgs/ohaf/slideshow2.png',
      '../static/imgs/ohaf/slideshow3.png',
      '../static/imgs/ohaf/slideshow4.png',
      '../static/imgs/ohaf/slideshow5.png',
      '../static/imgs/ohaf/slideshow6.png'
    ];
    ps.element = document.getElementById('renderer');
  });

  it('does nothing', (done) => {
    done();
  });

  // it('get html text', (done) => {
  //   const html = ps.html();
  //   expect(typeof html).toBe('object');
  //   done();
  // });
>>>>>>> 9c59d0887b1ee5747b88720138011f9c18296049
});
