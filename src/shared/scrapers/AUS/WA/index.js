import * as parse from '../../../lib/parse.js';
import * as fetch from '../../../lib/fetch/index.js';
import maintainers from '../../../lib/maintainers.js';

const getKey = rowLabel => {
  const lowerLabel = rowLabel.toLowerCase();
  if (lowerLabel.includes('cases (positive)')) {
    return 'cases';
  }
  if (lowerLabel.includes('tested (negative)')) {
    return 'tested';
  }
  if (lowerLabel.includes('recovered')) {
    return 'recovered';
  }
  if (lowerLabel.includes('deaths')) {
    return 'deaths';
  }
  if (lowerLabel.includes('unknown source')) {
    return 'discard';
  }
  throw new Error(`unknown row: ${lowerLabel}`);
};

const scraper = {
  country: 'AUS',
  maintainers: [maintainers.camjc],
  priority: 2,
  sources: [
    {
      description: 'Government of Western Australia, Department of Health',
      name: 'WA Health',
      url: 'https://ww2.health.wa.gov.au'
    }
  ],
  state: 'Western Australia',
  type: 'table',
  url: 'https://ww2.health.wa.gov.au/Articles/A_E/Coronavirus/COVID19-statistics',
  async scraper() {
    const $ = await fetch.page(this.url);
    const $table = $('table:first-of-type');
    const $trs = $table.find('tbody > tr:not(:first-child)');
    const data = { state: scraper.state };
    $trs.each((index, tr) => {
      const $tr = $(tr);
      const key = getKey($tr.find('td:first-child').text());
      data[key] = parse.number($tr.find('td:last-child').text());
    });
    data.tested += data.cases; // Tested is only negatives in this table.
    return data;
  }
};

export default scraper;
