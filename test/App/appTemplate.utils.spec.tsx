import type { AppTemplate } from 'src/App/AppTemplate';
import utils from 'src/App/AppTemplate/appTemplateUtils';
import type { ImenuItem } from 'src/App/AppTemplate/menuConfig';

describe('appTemplateUtils', ()=>{
  it('makeLink', ()=>{
    const menu = { link:'' } as ImenuItem;
    const view = { } as AppTemplate;
    const link = utils.makeLink(menu, 1, 'Link', view);
    expect(link.type).toBe('div');
  });
});
