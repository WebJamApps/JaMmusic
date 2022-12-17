import renderer from 'react-test-renderer';
import { Isettings, PicSlider, SliderContent } from 'src/containers/Music/Pictures/PicSlider';

const data:any = [
  { _id: 1, url: '../static/imgs/ohaf/slideshow2.png', comments: 'showCaption' },
  { _id: 2, url: '../static/imgs/ohaf/slideshow3.png' },
  { _id: 3, url: '../static/imgs/ohaf/slideshow4.png' },
  { _id: 4, url: '../static/imgs/ohaf/slideshow5.png' },
  { _id: 5, url: '../static/imgs/ohaf/slideshow6.png' },
];

const settings: Isettings = {
  autoplay: true,
  autoplaySpeed: 3000,
  infinite: true,
  speed: 1000,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  fade: true,
};

describe('picture slider component test', () => {
  it('is defined', () => {
    expect(PicSlider).toBeDefined();
  });
  it('renders SliderContent when having pics', () => {
    const slider:any = renderer.create(<SliderContent pics={data} settings={settings} />).toJSON();
    expect(slider.children[0].children[0].props.className).toBe('slick-list');
  });
});
