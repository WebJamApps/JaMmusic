import React from 'react';
import { shallow } from 'enzyme';
import HelloWorld from '../../src/components/react-comp';

describe('the App module', () => {
  let RC;
  beforeEach(() => {
    // document.body.innerHTML = '<div><div class="home"></div></div>';
    // element = document.getElementsByClassName('home')[0];
    // console.log(element);
    // console.log(new ReactComponent());
  });
  it('RC text should be "Hello World" ', () => {
    RC = shallow(<HelloWorld />);
    expect(RC.text()).toEqual('Hello World');
  });
  it('one toplevel element', () => {
    expect(RC).toHaveLength(1);
  });

  it('wrapper should match snapshot', () => {
    expect(RC).toMatchSnapshot();
  });
});
