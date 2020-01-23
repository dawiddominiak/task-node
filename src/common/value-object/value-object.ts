import * as R from 'ramda';

export abstract class ValueObject {
  public sameValueAs(other: ValueObject) {
    return other instanceof ValueObject && R.equals(this, other);
  }
}
