/* eslint-disable @typescript-eslint/no-explicit-any */
// import Renderer from 'react-test-renderer';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import { Music } from 'src/containers/Music';
import PicSlider from 'src/components/PicSlider';

function setup(images: any) {
  const wrapper = shallow(<Music images={images} />);
  return { wrapper };
}

describe('/music', () => {
  it('renders the component', () => {
    const { wrapper } = setup(undefined);
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
  });
  it('renders with images', () => {
    const data:any = [{ url: '', title: '' }];
    const wrapper2 = shallow(<Music images={data}/>);
    expect(wrapper2.find(PicSlider).exists()).toBe(true);
    expect(wrapper2).toMatchSnapshot();
  });
  it('renders when joshandmariamusic.com', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const { wrapper } = setup(undefined);
    expect(wrapper.find('div.page-content').exists()).toBe(true);
    expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
  });
  it('renders and runs useEffect', ()=> {
    const data:any = [{ url: '', title: '' }];
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(()=>{
      ReactDom.render(<Music images={data}/>, container);
    });
    const musicSlider = document.getElementById('musicSlide1');
    console.log(musicSlider);
    document.body.removeChild(container);
  });
});
