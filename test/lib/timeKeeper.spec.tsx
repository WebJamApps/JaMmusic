import * as React from 'react';
import { shallow } from 'enzyme';
import TimeKeeper from 'react-timekeeper';
import AddTime from '../../src/lib/timeKeeper';

describe('timeKeeper component', () => {
  let wrapper: any;
  beforeEach(() => {
    wrapper = shallow(<AddTime setFormTime={() => {}} />);
  });
  it('is defined', () => {
    expect(AddTime).toBeDefined();
  });
  it('renders correctly', () => {
    expect(wrapper).toMatchSnapshot();
  });
  it('handles click to setTime and to show the clock again after', () => {
    const wrapper2 = shallow(<AddTime setFormTime={(time: string) => expect(time).toBe('12:34pm')} />);
    wrapper2.find(TimeKeeper).get(0).props.onDoneClick();
    wrapper2.find('button.show-clock').simulate('click');
  });
  it('handles onChange to set the time', () => {
    const wrapper2 = shallow(<AddTime setFormTime={(time: string) => expect(time).toBe('1:00 pm')} />);
    wrapper2.find(TimeKeeper).get(0).props.onChange({ formatted12: '1:00 pm' });
  });
});
