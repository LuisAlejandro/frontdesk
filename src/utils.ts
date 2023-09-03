import { Enclosure, ExtraEntryField, ExtraEntryProperty, FeedItem } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getExtraEntryFields = (feedEntry: Record<string, any>) => {
  const extraFields: Partial<FeedItem> = {
    [ExtraEntryField.enclosure]: feedEntry[ExtraEntryField.enclosure]
      ? removeUndefinedProps<Enclosure>({
          url: feedEntry[ExtraEntryField.enclosure][ExtraEntryProperty.url] || undefined,
          type: feedEntry[ExtraEntryField.enclosure][ExtraEntryProperty.type] || undefined,
          length: feedEntry[ExtraEntryField.enclosure][ExtraEntryProperty.length] || undefined,
        })
      : undefined,
    [ExtraEntryField.category]: feedEntry[ExtraEntryField.category]?.[ExtraEntryProperty.text]
      ? feedEntry[ExtraEntryField.category][ExtraEntryProperty.text]
      : feedEntry[ExtraEntryField.category],
    [ExtraEntryField.pubDate]: feedEntry[ExtraEntryField.pubDate] || undefined,
  };

  return removeUndefinedProps(extraFields);
};

type GenericObject = {
  [key: string]: any;
};

export const removeUndefinedProps = <T = GenericObject>(obj: T) => {
  const result = {} as T;

  for (let prop in obj) {
    if (obj[prop] !== undefined) {
      result[prop] = obj[prop];
    }
  }

  return result;
};
