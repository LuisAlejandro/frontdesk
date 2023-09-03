import { Store } from 'cache-manager';

export type TimestampInMiliseconds = number;

export enum ExtraEntryField {
  category = 'category',
  pubDate = 'pubDate',
  enclosure = 'enclosure',
}

export enum ExtraEntryProperty {
  text = '@_text',
  href = '@_href',
  url = '@_url',
  type = '@_type',
  length = '@_length',
}

export type Enclosure = {
  url?: string;
  length?: string;
  type?: string;
};

interface FeedEntry {
  id: string;
  link?: string;
  title?: string;
  description?: string;
  published?: Date;
}

export type FeedItem = Omit<FeedEntry, 'published'> & {
  [key: string]: unknown;
  published: TimestampInMiliseconds;
  [ExtraEntryField.category]?: string;
  [ExtraEntryField.pubDate]?: string;
  [ExtraEntryField.enclosure]?: Enclosure;
};

export interface ICacheProperties {
  name?: string;
  store?: Store;
}

interface FsHashStoreOptions {
  path?: string | undefined;
  ttl?: number | undefined;
  maxsize?: number | undefined;
  subdirs?: boolean | undefined;
  zip?: boolean | undefined;
}

interface FsHashStoreConstructor {
  create: (config: FsHashStoreConfig) => Store;
}

export interface FsHashStoreConfig {
  store: FsHashStoreConstructor;
  options?: FsHashStoreOptions | undefined;
}
