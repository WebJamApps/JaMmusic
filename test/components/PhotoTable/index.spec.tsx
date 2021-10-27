/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import renderer from 'react-test-renderer';
import { PhotoTable } from '../../../src/components/PhotoTable';

describe('PhotoTable', () => {
  let photoTable:any, props: { auth: any; images: any; };
  const controller:any = { deleteData: jest.fn() };
  beforeEach(() => {
    props = {
      auth: { token: 'token' },
      images: [{
        _id: '456', url: 'url', title: 'title', type: 'youthPics', comments: 'showCaption',
      }],
    };
    photoTable = renderer.create(<PhotoTable
      auth={props.auth}
      images={props.images}
      dispatch={(fun) => fun}
      controller={controller}
    />);
  });
  it('renders correctly', () => { expect(photoTable.toJSON()).toMatchSnapshot(); });
});
