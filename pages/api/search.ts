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
    const { q: query } = req.query;

    const page = 0;

    if (typeof query !== 'string' || query.length === 0 || query.length > 5) {
      return res.status(400).send('Invalid search');
    }

    const numMatches = (page + 1) * RESULTS_PER_PAGE;
    const { matches, hasMoreResults } = findMatches(query, numMatches);

    res.status(200).json({ matches, hasMoreResults });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
