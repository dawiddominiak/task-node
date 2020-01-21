import * as R from 'ramda';

import { RetryableWorker, RetryOptions } from './retryable-worker';

describe('RetryableWorker', () => {
  const defaultRetryableOptions: RetryOptions = {
    repeatOptions: {
      limit: 5,
      msDelayFactory: (): number => 0,
    },
    repeatCondition: (): boolean => true,
  };

  describe('workWithRetries', () => {
    test('should run worker 5 times because of error', async () => {
      // Given
      const worker: jest.Mock = jest.fn()
      .mockRejectedValue(new Error('Test error'));

      const retryableWorker: RetryableWorker<number> = new RetryableWorker<number>(defaultRetryableOptions);

      // When
      await expect(
        retryableWorker.workWithRetries(worker),
      ).rejects
        .toThrowError(
          'Test error',
        );

      // Then
      expect(worker)
        .toHaveBeenCalledTimes(5);
    });

    test('should run worker 2 times because of error on first approach', async () => {
      // Given
      const worker: jest.Mock = jest.fn()
        .mockRejectedValueOnce(new Error('Test error'))
        .mockImplementation(() => 1);
      const retryableWorker: RetryableWorker<number> = new RetryableWorker<number>(defaultRetryableOptions);

      // When
      await expect(
        retryableWorker.workWithRetries(worker),
      )
        .resolves
        .toEqual(1);

      // Then
      expect(worker)
        .toHaveBeenCalledTimes(2);
    });

    test('should run worker 2 times because of proper error on first approach and wrong error on second one', async () => {
      // Given
      const worker: jest.Mock = jest.fn()
        .mockRejectedValueOnce(new Error('Expected error'))
        .mockRejectedValueOnce(new Error('Unexpected error'));

      const retryableWorker: RetryableWorker<number> = new RetryableWorker<number>(R.mergeDeepRight(defaultRetryableOptions, {
        repeatCondition: (error: Error): boolean => error.message === 'Expected error',
      }));

      // When
      await expect(
        retryableWorker.workWithRetries(worker),
      ).rejects
        .toThrowError(
          'Unexpected error',
        );

      // Then
      expect(worker)
        .toHaveBeenCalledTimes(2);
    });
  });
});
