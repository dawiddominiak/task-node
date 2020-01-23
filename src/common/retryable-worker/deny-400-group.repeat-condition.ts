import { AxiosError } from 'axios';
import { EOL } from 'os';

import { Logger } from '@nestjs/common';

export function determineIfErrorIsIn400Group(error: AxiosError, logger?: Logger) {
  const isAxiosError: boolean = error.isAxiosError;
  const hasErrorCode: boolean = typeof error.code === 'string' || typeof error.code === 'number';
  const errorCodeFrom4xxGroup: boolean = error.code?.toString().charAt(0) === '4';
  const retryable = isAxiosError && hasErrorCode && !errorCodeFrom4xxGroup;

  if (logger) {
    logger.warn(
      `
      Error ${error.code} during the fetch from HTTP.${EOL}
      ${ retryable ? 'Retrying' : 'Not retryable' }${EOL}
      ${error.message}${EOL}
      ${error.stack}
      `,
    );
  }

  return retryable;
}
