/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import superagent from 'superagent';
import renderer, { act } from 'react-test-renderer';
import SProvider from '../../src/providers/Songs.provider';
import testSongs from '../testSongs';
import { shallow } from 'enzyme';

// jest.mock('../src/providers/Songs.provider', () => {
//   return function MockedProvider(props: any) {
//     return (<div id="mockWrapper"></div>);
//   };
// });

describe('the songs provider', () => {
  const wrapper = shallow(<SProvider><div /></SProvider>);
  // it('renders', () => {
  //   expect(wrapper.find('div#wjfooter').exists()).toBe(true);
  // });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it
  //it('fetches the songs', () => {
  //   const res:any = { body: testSongs };
  //   const sa:any = { set: () => Promise.resolve(res) };
  //   superagent.get = jest.fn(() => sa);
  //   let component: renderer.ReactTestRenderer;
  //   act(() => {
  //     component = renderer.create(<SProvider><div /></SProvider>);
  //     if (component)expect(component.toJSON()).toMatchSnapshot();
  //   });
  //   expect(superagent.get).toBeCalledWith(`${process.env.BackendUrl}/song`);
  // });
  // it('catches error when fetches the songs', () => {
  //   const sa:any = { set: () => Promise.reject(new Error('bad')) };
  //   superagent.get = jest.fn(() => sa);
  //   act(() => {
  //     renderer.create(<SProvider><div /></SProvider>);
  //   });
  //   expect(superagent.get).toBeCalledWith(`${process.env.BackendUrl}/song`);
  // });
});
