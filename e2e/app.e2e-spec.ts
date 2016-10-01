import { BetssontestPage } from './app.po';

describe('betssontest App', function() {
  let page: BetssontestPage;

  beforeEach(() => {
    page = new BetssontestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
