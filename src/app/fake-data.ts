import { faker } from '@faker-js/faker';
import { toTable } from '../table/helpers/table-helper';
import { TableBuilder } from '../table/helpers/table-builder';

export interface Contract {
  readonly id: string;
  readonly clientName: string;
  readonly amount: number;
  readonly societyName: string;
  readonly openingDate: Date;
  readonly closingDate: Date;
}

export const createRandomContract = (): Contract => {
  const openingDate = faker.date.recent();
  return {
    id: faker.string.uuid(),
    clientName: faker.company.name(),
    amount: faker.number.int({ min: 10000, max: 100000 }),
    societyName: faker.commerce.productName(),
    openingDate,
    closingDate: faker.date.soon({ refDate: openingDate }),
  };
};

export const contracts = new Array(100)
  .fill(0)
  .map(() => createRandomContract());

export const contractsConf = TableBuilder.for<Contract>('id')
  .withColumn('amount', (c) => {
    c.withName('Montant')
      .parseValue((c) => `${c.toPrecision(2)} €`)
      .sticky();
  })
  .withColumn('clientName', (c) => {
    c.withName('Client')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society').sticky()
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .withColumn('societyName', (c) => {
    c.withName('Society')
  })
  .stickyHeader()
  .expandable(true)
  .withSelection('checkbox', true)
  .build();
