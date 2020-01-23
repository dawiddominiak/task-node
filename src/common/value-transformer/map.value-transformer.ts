import { ValueTransformer } from 'typeorm';

import { ValueError } from '../error/value.error';

export class MapValueTransformer implements ValueTransformer {
  public to(map: Map<any, any>) {
    return JSON.stringify([...map.entries()]);
  }

  public from(value: string) {
    try {
      return new Map(JSON.parse(value));
    } catch (err) {
      throw new ValueError(`Error when parsing JSON ${value} from the database.`, err);
    }
  }
}
