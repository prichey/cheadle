import type { NextApiRequest, NextApiResponse } from 'next';
import words from '../../lib/words';

type Data = any;

const RESULTS_PER_PAGE = 10;

const isMatch = (query: string, test: string) => {
  const queryChars = query.toLocaleLowerCase().split('');
  const testChars = test.toLowerCase().split('');

  const isntMatch = queryChars.some(
    // a query isn't a match if there exists some character that is not ? (which matches anything)
    // and does not match the character at the same index in the test string
    (char, i) => char !== '?' && char !== testChars[i]
  );

  return !isntMatch;
};

const findMatches = (query: string, numMatches: number = RESULTS_PER_PAGE) => {
  const matches: string[] = [];

  let i = 0;
  // find one more than was requested to give back with hasMoreResults bool
  while (matches.length < numMatches + 1 && i < words.length) {
    const word = words[i];

    if (isMatch(query, word)) {
      matches.push(word);
    }

    i++;
  }

  return {
    hasMoreResults: matches.length > numMatches,
    matches: matches.slice(0, numMatches),
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { q: query, p: page, slow = 'false' } = req.query;

    const pageNum =
      typeof page === 'string' && !Number.isNaN(parseInt(page))
        ? parseInt(page)
        : 0;

    if (typeof query !== 'string' || query.length === 0 || query.length > 5) {
      return res.status(400).send('Invalid search');
    }

    const numMatches = (pageNum + 1) * RESULTS_PER_PAGE;
    const { matches: allMatches, hasMoreResults } = findMatches(
      query,
      numMatches
    );

    // we fetch all matches from index 0 to whichever we need, so adjust to match only the requested page
    const matches = allMatches.slice(
      pageNum * RESULTS_PER_PAGE,
      (pageNum + 1) * RESULTS_PER_PAGE
    );

    const respond = () => res.status(200).json({ matches, hasMoreResults });

    if (slow === 'true') {
      // introduce artificial delay to simulate slow server
      const msToWait = 1000;
      setTimeout(respond, msToWait);
      return;
    }

    respond();
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
