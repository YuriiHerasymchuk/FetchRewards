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
    private transactions: Array<Transaction> = []; // all transactions
    private pointsLeftByTransactionId: Record<string, number> = {}; // not allocated points by transaction ID
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
            this.subtractPointsFromTransactions(usersTransactions, -transaction.points, transaction.timestamp)
        } else {
            this.pointsLeftByTransactionId[transactionId] = transactionPoints;
        }

        this.balanceByUser[userName] = currentUserBalance + transactionPoints;

        this.transactions.push(transaction);
        usersTransactions.push(transaction);
        PaymentService.sortTransactions(this.transactions);
        PaymentService.sortTransactions(usersTransactions);
    }
    
    spendPoints(pointsToSpend: number) {
        this.subtractPointsFromTransactions(this.transactions, pointsToSpend);
    }

    private subtractPointsFromTransactions(transactions: Array<Transaction>, pointsToAllocate: number, timestamp: Date | null = null) {
        const transactionsForAllocation = this.filterTransactionsForAllocation(transactions, pointsToAllocate, timestamp);
        
        for (const transaction of transactionsForAllocation) {
            const { _id: curTransactionId } = transaction;
            const transactionPointsLeft = this.pointsLeftByTransactionId[curTransactionId] || 0;
            if (transactionPointsLeft >= pointsToAllocate) {
                this.pointsLeftByTransactionId[curTransactionId] -= pointsToAllocate;
            } else {
                pointsToAllocate -= this.pointsLeftByTransactionId[curTransactionId];
                delete this.pointsLeftByTransactionId[curTransactionId];
            }
        }
    }

    private filterTransactionsForAllocation(transactions: Array<Transaction>, pointsToAllocate: number, timestamp: Date | null = null): Array<Transaction> {
        const transactionsForAllocation: Array<Transaction> = [];

        for (const transaction of transactions) {
            if (timestamp && transaction.timestamp > timestamp) break;

            const transactionPointsLeft = this.pointsLeftByTransactionId[transaction._id] || 0;
            if (transactionPointsLeft > 0) {
                pointsToAllocate -= this.pointsLeftByTransactionId[transaction._id];
                transactionsForAllocation.push(transaction);
            }
            if (pointsToAllocate <= 0) break;
        }
        if (pointsToAllocate > 0) throw new Error(`Not enough points`);

        return transactionsForAllocation;
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
    ps.addTransaction(new Transaction('DANNON', -200, new Date('2020-11-03T14:00:00Z')));
    ps.addTransaction(new Transaction('MILLER COORS', 10000, new Date('2020-11-01T14:00:00Z')));
    ps.spendPoints(5000);
} catch (err) {
    console.error(err);
}

ps.printTransactions();