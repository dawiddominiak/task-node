import { EntityRepository, Repository } from 'typeorm';

import { Rates } from './rates.entity';

@EntityRepository(Rates)
export class RatesRepository extends Repository<Rates> {
  public async getLatestRates(): Promise<Rates | undefined> {
    const results = await this.find({
      order: {
        date: 'DESC',
      },
      take: 1,
    });

    return results[0];
  }
}
