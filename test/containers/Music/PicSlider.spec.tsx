import renderer from 'react-test-renderer';
import { PicSlider } from 'src/containers/Music/Pictures/PicSlider';

// const data:any = [
//   { _id: 1, url: '../static/imgs/ohaf/slideshow2.png', comments: 'showCaption' },
//   { _id: 2, url: '../static/imgs/ohaf/slideshow3.png' },
//   { _id: 3, url: '../static/imgs/ohaf/slideshow4.png' },
//   { _id: 4, url: '../static/imgs/ohaf/slideshow5.png' },
//   { _id: 5, url: '../static/imgs/ohaf/slideshow6.png' },
// ];

describe('picture slider component test', () => {
  it('is defined', () => {
    expect(PicSlider).toBeDefined();
    // expect(data).toBeDefined();
  });
  it('renders with undefined images', () => {
    const slider:any = renderer.create(<PicSlider />).toJSON();
    expect(slider.children[0].children[0]).toBe('');
  });
});
