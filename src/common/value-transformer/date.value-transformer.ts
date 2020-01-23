import * as moment from 'moment';
import { ValueTransformer } from 'typeorm';

export class DateValueTransformer implements ValueTransformer {
  public to(value: Date) {
    return moment(value).valueOf();
  }

  public from(value: number) {
    return moment(value).toDate();
  }
}
