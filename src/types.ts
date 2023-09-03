import { FeedEntry } from '@extractus/feed-extractor';

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

export type FeedItem = Omit<FeedEntry, 'published'> & {
  [key: string]: unknown;
  published: TimestampInMiliseconds;
  [ExtraEntryField.category]?: string;
  [ExtraEntryField.pubDate]?: string;
  [ExtraEntryField.enclosure]?: Enclosure;
};
