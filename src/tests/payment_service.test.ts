import { PaymentService } from '../services/payment_service';
import Transaction from '../models/transaction';
const payer = 'DANNON',
    orderedTimestamps = ['2020-11-03T14:00:00Z', '2020-11-04T14:00:00Z', '2020-11-05T14:00:00Z'];

describe('PaymentService', () => {
    const ps = new PaymentService();

    it('adds positive transaction', () => {
        const positiveTransaction = Transaction.create(payer, 2000, orderedTimestamps[1]);
        ps.addTransaction(positiveTransaction);
        expect(ps.transactions[0]).toMatchObject(positiveTransaction);
    });

    it('adds negative transaction', () => {
        const negativeTransaction = Transaction.create(payer, -100, orderedTimestamps[2]);
        ps.addTransaction(negativeTransaction);
        expect(ps.transactions[1]).toMatchObject(negativeTransaction);
    });

    it(`throws on payer's points going negative`, () => {
        const negativeTransaction = Transaction.create(payer, -2000, orderedTimestamps[2]);
        const addingNegativeTransaction = () => ps.addTransaction(negativeTransaction);
        expect(addingNegativeTransaction).toThrow(/Not enough points to add transaction/);
    });

    it(`throws on payer not having points at time`, () => {
        const negativeTransaction = Transaction.create(payer, -100, orderedTimestamps[0]);
        const addingNegativeTransaction = () => ps.addTransaction(negativeTransaction);
        expect(addingNegativeTransaction).toThrow(/Not enough points at current time/);
    });

    it(`throws on 0 points transaction`, () => {
        const zeroTransaction = Transaction.create(payer, 0, orderedTimestamps[0]);
        const addingNegativeTransaction = () => ps.addTransaction(zeroTransaction);
        expect(addingNegativeTransaction).toThrow(/Invalid 0 points transaction/);
    });

    it(`spends points`, () => {
        const positiveTransaction = Transaction.create(`${payer}2`, 2000, orderedTimestamps[2]);
        ps.addTransaction(positiveTransaction);
        const result = ps.spendPoints(3000);
        expect(result).toEqual([
            { payer: 'DANNON', points: -1900 },
            { payer: 'DANNON2', points: -1100 }
          ]);
    });

    it(`balance`, () => {
        expect(ps.balance).toEqual({ DANNON: 0, DANNON2: 900 });
    });
});

describe('PaymentService batch add', () => {
    const ps = new PaymentService();
    
    it('adds transactions in a batch', () => {
        const transactions = [
            Transaction.create(payer, 2000, orderedTimestamps[1]),
            Transaction.create(payer, 120, orderedTimestamps[0]),
            Transaction.create(payer, -2120, orderedTimestamps[2]),
            Transaction.create(payer, 300, orderedTimestamps[1]),
        ];
        ps.addTransactions(transactions);
        expect(ps.transactions).toMatchObject(transactions);
    });
});