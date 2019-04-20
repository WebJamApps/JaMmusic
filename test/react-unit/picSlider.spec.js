import React from 'react';
import { shallow } from 'enzyme';
import { PicSlider } from '../../src/components/pic-slider';


describe('picture slider component test setup', () => {
  let ps;
  //   let ps = shallow(<PicSlider data={[]} caption="this is it" />);

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
});
