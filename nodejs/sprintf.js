#!/usr/bin/env node

const { sprintf } = require('sprintf-js');
const multiChar = (s) => { return [...s].reduce((m, c) => {
    if (Math.min(new Buffer.from(c).length, 2) === 2)  m++;
    return m;
  }, 0);
};
const getWidth = (s) => { return s.length + multiChar(s); };
const stations = [ { en: 'Tokyo', ja: '東京' }, { en: 'Kanda', ja: '神田' }, { en: 'Akihabara', ja: '秋葉原' } ];
const width = (() => {
  const w = { en: 0, ja: 0 };
  stations.forEach((s) => {
    if (getWidth(s.en) > w.en)  w.en = getWidth(s.en);
    if (getWidth(s.ja) > w.ja)  w.ja = getWidth(s.ja);
  })
  return w;
})();

stations.forEach((station) => {
  console.log(sprintf(`%-${width.ja-multiChar(station.ja)}s %-${width.en-multiChar(station.en)}s`, station.ja, station.en));
})
