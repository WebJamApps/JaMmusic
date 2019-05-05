import throttle from '../../src/commons/utils';

test('test throttle function', () => {
  const throt = throttle(() => {}, 1);
  throt();
  throt();
});
