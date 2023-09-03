import { setFailed, setOutput, getInput } from '@actions/core';

import { getCache } from './cache';
import { fetchLatestFeedItems } from './feed';

export const runAction = async () => {
  try {
    const cacheKey = getInput('name');
    const feedUrl = getInput('feed_url');
    const maxEntries = Number(getInput('max_entries'));

    const lastRSSEntryCache = await getCache(cacheKey);
    const lastRSSEntry = (await lastRSSEntryCache.get<string>(cacheKey)) || '{}';

    const feedItems = await fetchLatestFeedItems(feedUrl, maxEntries, JSON.parse(lastRSSEntry));

    if (feedItems && feedItems.length > 0) {
      const lastEntry = feedItems.slice(-1)[0];
      await lastRSSEntryCache.set<string>(cacheKey, JSON.stringify(lastEntry));
    }

    setOutput('result', JSON.stringify(feedItems));
  } catch (error) {
    if (error instanceof Error) setFailed(error.message);
    return;
  }
};
