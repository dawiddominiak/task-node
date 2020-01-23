import { ValueTransformer } from 'typeorm';

import { ValueError } from '../error/value.error';

export class JSONValueTransformer implements ValueTransformer {
  public to(value: object) {
    return JSON.stringify(value);
  }

  public from(value: string) {
    try {
      return JSON.parse(value);
    } catch (err) {
      throw new ValueError(`Error when parsing JSON ${value} from the database.`, err);
    }
  }
}
