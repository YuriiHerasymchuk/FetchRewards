import { v4 as uuidv4 } from 'uuid';

class Transaction implements Transaction {
    constructor(
        readonly payer: string,
        readonly points: number,
        readonly timestamp: Date,
        readonly _id = uuidv4()
    ) { }

    static create(payer: string, points: number | string, timestamp: Date | string) {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        if (isNaN(date.getTime())) throw new Error('Invalid timestamp');

        const pointsInt = typeof points === 'string' ? parseInt(points) : points;
        if (isNaN(pointsInt)) throw new Error('Invalid points');

        return new Transaction(payer, pointsInt, date);
    }
}

export const createTransaction = Transaction.create;
export default Transaction;