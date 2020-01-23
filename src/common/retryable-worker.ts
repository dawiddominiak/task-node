import * as R from 'ramda';
import { promisify } from 'util';

export interface RetryOptions {
  repeatOptions?: {
    limit?: number;
    msDelayFactory?(approachCounter: number): number;
  };
  repeatCondition?(error?: Error): boolean;
}

export const MAX_RETRIES: number = 15;
const setTimeoutAsync = promisify(setTimeout);

/**
 * Worker that retries given work in a loop.
 */
export class RetryableWorker<K> {
  private readonly options: RetryOptions;

  constructor(optionsOverride?: RetryOptions) {
    const defaultOptions: RetryOptions = {
      repeatOptions: {
        limit: MAX_RETRIES,
        msDelayFactory: (approachCounter: number): number =>
          Math.max((approachCounter ** 2) * 200, 60 * 1000), // 200, 800, 1800, 3200, ..., 60000, 60000 etc.
      },
      repeatCondition: (): boolean => true,
    };

    // I used merge to deeply merge two objects
    this.options = R.mergeDeepRight(defaultOptions, optionsOverride);
  }

  public static async run<K>(worker: () => Promise<K>, optionsOverride?: RetryOptions): Promise<K> {
    return new RetryableWorker<K>(optionsOverride).workWithRetries(worker);
  }

  public async workWithRetries(
    worker: () => Promise<K>,
  ): Promise<K> {

    let result: K;
    let areRepeatConditionsMet: boolean;
    let approachCounter: number = 0;

    // limit can not be lower than 0
    const limit: number = this.options.repeatOptions.limit > 0 ? this.options.repeatOptions.limit : 0;

    do {
      areRepeatConditionsMet = false;

      if (approachCounter > 0) {
        await setTimeoutAsync(this.options.repeatOptions.msDelayFactory(approachCounter));
      }

      try {
        result = await worker();

        return result;
      } catch (error) {
        approachCounter += 1;
        areRepeatConditionsMet = this.options.repeatCondition(error) && limit > approachCounter;

        if (!areRepeatConditionsMet) {
          throw error;
        }
      }
    } while (areRepeatConditionsMet);
  }
}
