/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
// import { shallow } from 'enzyme';
import { Music } from 'src/containers/Music';
import { ClickToListen } from 'src/containers/Music/intro';
// import PicSlider from 'src/components/PicSlider';
import { BrowserRouter } from 'react-router-dom';

// function setup(images: any) {
//   const wrapper = shallow(<Music images={images} />);
//   return { wrapper };
// }

describe('/music', () => {
  // it('renders the component', () => {
  //   const { wrapper } = setup(undefined);
  //   expect(wrapper.find('div.page-content').exists()).toBe(true);
  //   expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
  // });
  // it('renders with images', () => {
  //   const data:any = [{ url: '', title: '' }];
  //   const wrapper2 = shallow(<Music images={data}/>);
  //   expect(wrapper2.find(PicSlider).exists()).toBe(true);
  //   expect(wrapper2).toMatchSnapshot();
  // });
  // it('renders when joshandmariamusic.com', () => {
  //   process.env.APP_NAME = 'joshandmariamusic.com';
  //   const { wrapper } = setup(undefined);
  //   expect(wrapper.find('div.page-content').exists()).toBe(true);
  //   expect(wrapper.find('Intro').dive().find('.intro').exists()).toBe(true);
  // });
  it('renders and runs useEffect', ()=> {
    const data:any = [{ url: '', title: '' }];
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(()=>{
      ReactDom.render(<Music images={data} auth={null}/>, container);
    });
    const musicSlider:any = document.getElementById('musicSlide1');
    expect(musicSlider).toBeDefined();
    document.body.removeChild(container);
  });
  it('renders ClickToListen and handles click when joshandmariamusic.com', ()=>{
    window.open = jest.fn();
    const ctl = renderer.create(<ClickToListen appName="joshandmariamusic.com"/>).root;
    ctl.findByProps({ variant:'contained' }).props.onClick();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).toHaveBeenCalled();
  });
  it('renders ClickToListen and handles click when web-jam.com', ()=>{
    window.open = jest.fn();
    const ctl = renderer.create(<BrowserRouter><ClickToListen appName="web-jam.com"/></BrowserRouter>).root;
    ctl.findByProps({ variant:'contained' }).props.onClick();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).not.toHaveBeenCalled();
  });
  it('renders ClickToListen and handles click when undefined appName', ()=>{
    window.open = jest.fn();
    const ctl = renderer.create(<BrowserRouter><ClickToListen/></BrowserRouter>).root;
    ctl.findByProps({ variant:'contained' }).props.onClick();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(window.open).not.toHaveBeenCalled();
  });
});
