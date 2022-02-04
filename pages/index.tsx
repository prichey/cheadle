import {
  ChangeEventHandler,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import useSWR from 'swr';

import styles from '../styles/Home.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Data {
  matches: string[];
  hasMoreResults: boolean;
}

interface ResultsProps {
  data?: Data;
  onLoadMore: () => void;
}

const Results: FC<ResultsProps> = ({ data, onLoadMore }) => {
  if (!data) {
    // TODO: render 'loading...' if taking too long
    return null;
  }

  const { matches = [], hasMoreResults } = data;

  console.log({ hasMoreResults });

  if (matches.length === 0) {
    return <p>no matches found :(</p>;
  }

  return (
    <>
      <ul>
        {matches.map((match) => (
          <li key={match}>{match}</li>
        ))}
      </ul>
      {hasMoreResults && (
        <button onClick={onLoadMore}>Load more results</button>
      )}
    </>
  );
};

const Home: NextPage = () => {
  const [query, setQuery] = useState('');

  const { data } = useSWR<Data>(
    query ? `/api/search?q=${query}` : null,
    fetcher
  );

  const matches: string[] = useMemo(() => {
    if (!data || !query) {
      return [];
    }

    return data.matches ?? [];
  }, [data, query]);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.target.value) {
        if (e.target.value !== query) {
          setQuery(e.target.value);
        }
      } else {
        setQuery('');
      }
    },
    [query]
  );

  const handleLoadMoreClick = useCallback(() => {
    console.log('load more');
  }, []);

  useEffect(() => {
    console.log({ query, matches });
  }, [query, matches]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Cheadle</h1>
        <div className={styles.search}>
          <input
            className={styles.input}
            type="search"
            placeholder="search"
            maxLength={5}
            onChange={handleInputChange}
          />

          {query && <Results data={data} onLoadMore={handleLoadMoreClick} />}
        </div>
        <div className={styles['cheadle-wrap']}>
          <Image
            src="/cheadle.jpg"
            alt="Don Cheadle"
            width={681 / 2}
            height={383 / 2}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
