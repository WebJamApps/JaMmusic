/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';

import superagent from 'superagent';
import songsTableUtils from '../../../src/components/SongsTable/songsTableUtils';

describe('songsTableUtils', () => {
  it('is defined', () => {
    expect(songsTableUtils).toBeDefined();
  });
  it('adds buttons to the modify column', () => {
    const song:any = { _id: '123' };
    const result = songsTableUtils.addButtons([song], 'token', jest.fn(), {});
    expect(result[0].modify).toBeDefined();
    window.confirm = jest.fn(() => false);
    const buttonDiv = shallow(result[0].modify || <div />);
    const deleteResult = buttonDiv.find('button#deleteSong123').simulate('click');
    expect(deleteResult).toBeDefined();
    const editResult = buttonDiv.find('button#editSong123').simulate('click');
    expect(editResult).toBeDefined();
  });
  it('catches error when sends the rest call to delete the song', async () => {
    window.confirm = jest.fn(() => true);
    const result = await songsTableUtils.deleteSong('123', 'token');
    expect(result.includes('of undefined')).toBe(true);
  });
  it('sends the rest call to delete the song', async () => {
    window.confirm = jest.fn(() => true);
    const newDelete:any = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ status: 200 }) }) }));
    superagent.delete = newDelete;
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true,
    });
    const result = await songsTableUtils.deleteSong('123', 'token');
    expect(result.includes('deleted pic')).toBe(true);
  });
  it('sends the rest call to delete the song but receives 400 response', async () => {
    window.confirm = jest.fn(() => true);
    const newDelete:any = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ status: 400 }) }) }));
    superagent.delete = newDelete;
    const result = await songsTableUtils.deleteSong('123', 'token');
    expect(result.includes('400')).toBe(true);
  });
  it('scrolls to top of form after edit button click', () => {
    const song:any = { _id: '123' };
    const editSong = jest.fn();
    const result = songsTableUtils.addButtons([song], 'token', editSong, {});
    expect(result[0].modify).toBeDefined();
    window.confirm = jest.fn(() => false);
    const wrapper = shallow(result[0].modify || <div />);
    wrapper.find('button#editSong123').simulate('click');
    expect(editSong).toHaveBeenCalled();
  });
  it('does notscrollIntoView', () => {
    const anyData:any = {};
    expect(songsTableUtils.editSong(anyData, jest.fn(), {}, null)).toBe(true);
  });
  it('scrollIntoView', () => {
    const anyData:any = {};
    const anyElement:any = { scrollIntoView: jest.fn() };
    expect(songsTableUtils.editSong(anyData, jest.fn(), {}, anyElement)).toBe(true);
    expect(anyElement.scrollIntoView).toHaveBeenCalled();
  });
});
