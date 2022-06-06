import { v4 as uuidv4 } from 'uuid';

interface Transaction {
    readonly _id: string;
    readonly payer: string;
    readonly points: number;
    readonly timestamp: Date;
}

class Transaction implements Transaction {
    constructor(readonly payer: string, readonly points: number, readonly timestamp: Date, readonly _id = uuidv4()) {
    }
}

class PaymentService {
    private transactions: Array<Transaction> = [];
    private pointsLeftByTransactionId: Record<string, number> = {};
    private transactionsByUser: Record<string, Array<Transaction>> = {};
    private balanceByUser: Record<string, number> = {};


    constructor () {}

    addTransaction(transaction: Transaction) {
        const { _id: transactionId, payer: userName, points: transactionPoints } = transaction;
        const usersTransactions = this.transactionsByUser[transaction.payer] = this.transactionsByUser[transaction.payer] || [];
        if (transactionPoints === 0) throw new Error(`Invalid 0 points transaction: ${JSON.stringify(transaction)}`);

        const currentUserBalance = this.balanceByUser[userName] || 0;
        if (transactionPoints < 0) {
            if (currentUserBalance + transactionPoints < 0) throw new Error(`Not enough points to add transaction: ${JSON.stringify(transaction)}`);
            this.subtractPointsForNegativeTransaction(usersTransactions, transaction)
        } else {
            this.pointsLeftByTransactionId[transactionId] = transactionPoints;
        }

        this.balanceByUser[userName] = currentUserBalance + transactionPoints;

        this.transactions.push(transaction);
        usersTransactions.push(transaction);
        PaymentService.sortTransactions(this.transactions);
        PaymentService.sortTransactions(usersTransactions);
    }

    subtractPointsForNegativeTransaction(transactions: Array<Transaction>, transaction: Transaction) {
        let pointsToAllocate = -transaction.points;
        for (const usersTransaction of transactions) {
            if (usersTransaction.timestamp > transaction.timestamp) break;

            const { _id: curTransactionId } = usersTransaction;
            const points = this.pointsLeftByTransactionId[curTransactionId] || 0;
            if (points > 0) {
                if (points >= pointsToAllocate) {
                    this.pointsLeftByTransactionId[curTransactionId] -= pointsToAllocate;
                    pointsToAllocate = 0;
                    break;
                } else {
                    pointsToAllocate -= this.pointsLeftByTransactionId[curTransactionId];
                    delete this.pointsLeftByTransactionId[curTransactionId];
                }
            }
        }
        if (pointsToAllocate > 0) throw new Error(`Not enough points at the time of the transaction: ${JSON.stringify(transaction)}`);
    }

    printTransactions() {
        console.log(this.transactions);
        console.log(this.pointsLeftByTransactionId);
        console.log(this.transactionsByUser);
    }

    static sortTransactions (transactions: Array<Transaction>) { // TODO: move from here
        transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // TODO: redo sort
    }
}

const ps = new PaymentService();

try {
    ps.addTransaction(new Transaction('DANNON', 1000, new Date('2020-11-02T14:00:00Z')));
    ps.addTransaction(new Transaction('UNILEVER', 200, new Date('2020-10-31T11:00:00Z')));
    ps.addTransaction(new Transaction('DANNON', 300, new Date('2020-10-31T10:00:00Z')));
    ps.addTransaction(new Transaction('DANNON', -200, new Date('2020-10-31T15:00:00Z')));
    ps.addTransaction(new Transaction('MILLER COORS', 10000, new Date('2020-11-01T14:00:00Z')));
} catch (err) {
    console.error(err);
}

ps.printTransactions();