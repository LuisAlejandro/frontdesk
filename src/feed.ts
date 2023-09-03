import { extract } from '@extractus/feed-extractor';

import { FeedItem } from './types';
import { getExtraEntryFields } from './utils';
import { logger } from './logger';

export class Feed {
  url: string;

  private items: FeedItem[] | undefined;

  constructor(url: string) {
    logger.info(`Setting up feed: ${url}`);

    this.url = url;
    this.items = undefined;
  }

  private async extract() {
    logger.debug(`Extracting feed: ${this.url}`);

    const items = (
      await extract(this.url, {
        descriptionMaxLen: 999999,
        xmlParserOptions: {
          ignoreAttributes: false,
          allowBooleanAttributes: true,
        },
        getExtraEntryFields,
      })
    ).entries;

    this.items = items?.map((entry) => ({
      ...entry,
      published: entry.published ? new Date(entry.published).getTime() : 0,
    }));
  }

  private async getItems() {
    if (!this.items) {
      logger.info(`Fetching feed ...`);
      await this.extract();
    }
    return this.items;
  }

  private orderItems = (items: FeedItem[]) => {
    return items.sort((first: FeedItem, second: FeedItem) => second.published - first.published);
  };

  private async getOrderedItems() {
    const items = await this.getItems();

    if (!items) {
      logger.warning('Feed is empty!');
      return undefined;
    }

    logger.info(`Ordering feed entries ...`);
    return this.orderItems(items);
  }

  private filterItems = (items: FeedItem[], afterDate: number) => {
    return items.filter((item) => item.published > afterDate);
  };

  private async getFilteredItems(afterDate: number) {
    const items = await this.getOrderedItems();

    if (!items) {
      logger.warning('Feed is empty!');
      return undefined;
    }

    logger.info(`Removing entries published before ${new Date(afterDate).toISOString()} ...`);
    return this.filterItems(items, afterDate);
  }

  private truncateItems = (items: FeedItem[], maxEntries: number) => {
    return items.slice(-maxEntries);
  };

  private async getTruncatedItems(afterDate: number, maxEntries: number) {
    const items = await this.getFilteredItems(afterDate);

    if (!items) {
      logger.warning('Feed is empty!');
      return undefined;
    }

    logger.info(`Obtaining last ${maxEntries} entries from feed ...`);
    return this.truncateItems(items, maxEntries);
  }

  async parse(afterDate: number, maxEntries: number) {
    logger.info(`Parsing feed ...`);

    const items = await this.getTruncatedItems(afterDate, maxEntries);

    if (!items) {
      logger.warning('Feed is empty!');
      return undefined;
    }

    return items;
  }
}

export const fetchLatestFeedItems = (url: string, maxEntries: number, lastEntry: FeedItem) => {
  const feed = new Feed(url);
  return feed.parse(lastEntry.published || 0, maxEntries);
};
