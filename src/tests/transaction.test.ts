import { uuidRegex } from '../services/helper'
import { createTransaction } from '../models/transaction';

describe('Transaction', () => {
    const payer = 'DANNON', points = 200, timestamp = '2020-11-03T14:00:00Z';

    it('creates transaction from string timestamp', () => {
        const transaction = createTransaction(payer, points, timestamp);
        expect(transaction).toMatchObject({
            payer, points,
            timestamp: new Date(timestamp),
            _id: uuidRegex
        });
    });

    it('creates transaction from Date timestamp', () => {
        const transaction = createTransaction(payer, points, new Date(timestamp));
        expect(transaction).toMatchObject({
            payer, points,
            timestamp: new Date(timestamp),
            _id: uuidRegex
        });
    });

    it('throws on invalid timestamp', () => {
        expect(() => createTransaction('', 100, '')).toThrowError(/Invalid timestamp/);
    });

    it('throws on invalid points', () => {
        expect(() => createTransaction('', '', '2020-11-04T14:00:00Z')).toThrowError(/Invalid points/);
    });
});