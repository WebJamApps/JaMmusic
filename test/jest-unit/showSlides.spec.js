const showSlides = require('../../src/commons/showSlides');

describe('the showSlides module', () => {
  it('does nothing when id is not found', async () => {
    const doc = {
      getElementById() {
        return null;
      }
    };
    let res;
    document.body.innerHTML = '';
    try {
      res = await showSlides.showSlides(['booya'], doc);
      expect(res).toBe(1);
    } catch (e) {
      throw e;
    }
  });
});
