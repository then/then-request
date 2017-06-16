import {parse, stringify} from 'qs';

export default function handleQs(url: string, query: {[key: string]: any}): string {
  const [start, part2] = url.split('?');
  let qs = (part2 || '').split('#')[0];
  const end = part2 && part2.split('#').length > 1 ? '#' + part2.split('#')[1] : '';

  const baseQs = parse(qs);
  for (var i in query) {
    baseQs[i] = query[i];
  }
  qs = stringify(baseQs);
  if (qs !== '') {
    qs = '?' + qs;
  }
  return start + qs + end;
}
