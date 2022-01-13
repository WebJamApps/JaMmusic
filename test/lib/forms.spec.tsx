// ;
import renderer from 'react-test-renderer';
import forms from '../../src/lib/forms';

describe('forms', ()=>{
  it('makeDropDown', ()=>{
    const onChangeMock = jest.fn();
    const input = renderer.create(forms.makeDropdown('test', 'test', onChangeMock, [])).root;
    input.findByType('select').props.onChange();
    expect(onChangeMock).toHaveBeenCalled();
  });
});
