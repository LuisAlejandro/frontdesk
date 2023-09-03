import { setFailed, setOutput, getInput } from '@actions/core';

import { getCache } from './cache';
import { fetchLatestFeedItems } from './feed';

export const runAction = async () => {
  try {
    const feedUrl = getInput('feed-url');
    const maxEntries = Number(getInput('max-entries'));

    // get last entry from cache, then get its id, title, and date
    const lastRSSEntryCache = await getCache('last-rss-entry');
    const lastRSSEntry = (await lastRSSEntryCache.get<string>('last-rss-entry')) || '{}';

    const feedItems = await fetchLatestFeedItems(feedUrl, maxEntries, JSON.parse(lastRSSEntry));

    if (feedItems && feedItems.length > 0) {
      const lastEntry = feedItems.slice(-1);
      await lastRSSEntryCache.set<string>('last-rss-entry', JSON.stringify(lastEntry));
    }

    setOutput('result', JSON.stringify(feedItems));
  } catch (error) {
    if (error instanceof Error) setFailed(error.message);
    return;
  }
};
