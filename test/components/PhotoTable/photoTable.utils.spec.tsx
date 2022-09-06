/* eslint-disable @typescript-eslint/no-explicit-any */
import renderer from 'react-test-renderer';
import utils from '../../../src/components/PhotoTable/photoTable.utils';
// ;

describe('photoTable.utils', () => {
  it('setCustomBody when null value', () => {
    const result = renderer.create(utils.setCustomBody(null, 'test')).root;
    expect(result.findByType('div')).toBeDefined();
  });
  it('addThumbs when caption is hide and handles click on buttons', () => {
    const imgArr:any[] = [{ comments: '', modify: null }];
    const deleteData = jest.fn();
    const arr:any[] = utils.addThumbs(imgArr, { deleteData }, jest.fn());
    const buttons = renderer.create(arr[0].modify).root;
    const allButtons = buttons.findAllByType('button');
    allButtons[0].props.onClick();
    expect(deleteData).toHaveBeenCalled();
    expect(allButtons[1].props.onClick()).toBe(true);
  });
});
