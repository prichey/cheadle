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
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import styles from '../styles/Home.module.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Data {
  matches: string[];
  hasMoreResults: boolean;
}

interface ResultsProps {
  data?: Data;
  onLoadMore?: () => void;
  hasWaited?: boolean;
}

const Results: FC<ResultsProps> = ({ data, onLoadMore, hasWaited = true }) => {
  if (!data) {
    return hasWaited ? <p>loading...</p> : null;
  }

  const { matches = [], hasMoreResults } = data;

  if (hasWaited && matches.length === 0) {
    return <p>no matches found :(</p>;
  }

  return (
    <>
      <ul className={styles.results}>
        {matches.map((match) => (
          <li key={match} className={styles.result}>
            {match}
          </li>
        ))}
      </ul>
      {onLoadMore && hasMoreResults && (
        <button onClick={onLoadMore} className={styles['load-more']}>
          Load more results
        </button>
      )}
    </>
  );
};

const Home: NextPage = () => {
  const [query, setQuery] = useState('');
  const [hasWaited, setHasWaited] = useState(false); // convenience to prevent flashes of content

  useEffect(() => {
    const msToWait = 150;
    setHasWaited(false);
    const timeout = setTimeout(() => setHasWaited(true), msToWait);

    return () => clearTimeout(timeout);
  }, [query]);

  const getKey: SWRInfiniteKeyLoader = useMemo(
    () => (pageIndex) => {
      if (!query) {
        return null; // no query, no need to fetch
      }

      return `/api/search?q=${query}&p=${pageIndex}`;
    },
    [query]
  );

  const {
    data: dataPages,
    size,
    setSize,
  } = useSWRInfinite<Data>(getKey, fetcher);

  const data: Data = useMemo(() => {
    if (!dataPages || dataPages.length === 0) {
      return {
        matches: [],
        hasMoreResults: false,
      };
    }

    const matches = dataPages.reduce(
      (acc, page) => [...acc, ...page.matches],
      [] as string[]
    );

    return {
      matches,
      hasMoreResults: dataPages[dataPages.length - 1].hasMoreResults ?? false,
    };
  }, [dataPages]);

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
    setSize(size + 1);
  }, [setSize, size]);

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

          {query && (
            <div className={styles['results-wrap']}>
              <Results
                data={data}
                onLoadMore={handleLoadMoreClick}
                hasWaited={hasWaited}
              />
            </div>
          )}
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
