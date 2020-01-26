import { AxiosError } from 'axios';

import { LoggerService } from '@nestjs/common';

import { determineIfErrorIsNotIn400Group } from './deny-400-group.repeat-condition';

describe('determineIfErrorIsIn400Group', () => {
  it('should determine error not in 400 group', () => {
    expect(
      determineIfErrorIsNotIn400Group(
        {
          isAxiosError: true,
          code: '500',
        } as unknown as AxiosError,
        {
          warn: () => void 0,
        } as unknown as LoggerService,
      ),
    ).toBeTruthy();
  });

  it('should determine error in 400 group', () => {
    expect(
      determineIfErrorIsNotIn400Group(
        {
          isAxiosError: true,
          code: '400',
        } as unknown as AxiosError,
        {
          warn: () => void 0,
        } as unknown as LoggerService,
      ),
    ).toBeFalsy();
  });
});
