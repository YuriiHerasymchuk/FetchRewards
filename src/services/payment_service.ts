import Transaction from '../models/transaction'
import { sortTransactions } from './helper';

export class PaymentService {
    private _transactions: Array<Transaction> = [];
    private _pointsLeftByTransactionId: Record<string, number> = {};
    private _transactionsByPayer: Record<string, Array<Transaction>> = {};
    private _balanceByPayer: Record<string, number> = {};

    constructor() { }

    get transactions(): Readonly<Array<Transaction>> {
        return this._transactions;
    }

    get balance(): Readonly<Record<string, number>> {
        return this._balanceByPayer;
    }

    addTransactions(transactions: Array<Transaction>) {
        sortTransactions(transactions); // to prevent "Not enough points at current time" error if transactions are not sorted properly
        return transactions.map(transaction => this.addTransaction(transaction));
    }

    addTransaction(transaction: Transaction) {
        const { _id: transactionId, payer: userName, points: transactionPoints } = transaction;
        const usersTransactions = this._transactionsByPayer[transaction.payer] = this._transactionsByPayer[transaction.payer] || [];
        const currentUserBalance = this._balanceByPayer[userName] = this._balanceByPayer[userName] || 0;

        if (transactionPoints === 0) throw new Error(`Invalid 0 points transaction: ${JSON.stringify(transaction)}`);
        if (transactionPoints < 0) {
            if (currentUserBalance + transactionPoints < 0) throw new Error(`Not enough points to add transaction`);
            this.subtractPointsFromTransactions(usersTransactions, -transaction.points, transaction.timestamp);
        } else {
            this._pointsLeftByTransactionId[transactionId] = transactionPoints;
            this._balanceByPayer[userName] += transactionPoints;
        }

        // TODO: rework instead of pushing and sorting use skip list data structure and just add to it
        // currently the time complexity is O(nlogn). with skip list it's O(logn)
        this._transactions.push(transaction);
        usersTransactions.push(transaction);
        sortTransactions(this._transactions);
        sortTransactions(usersTransactions);

        return transaction;
    }

    spendPoints(pointsToSpend: number) {
        return this.subtractPointsFromTransactions(this._transactions, pointsToSpend);
    }

    private subtractPointsFromTransactions(transactions: Array<Transaction>, pointsToAllocate: number, timestamp: Date | null = null) {
        const transactionsForAllocation = this.filterTransactionsForAllocation(transactions, pointsToAllocate, timestamp);
        const adjustments = [];

        for (const transaction of transactionsForAllocation) {
            const { _id: curTransactionId } = transaction,
                transactionPointsLeft = this._pointsLeftByTransactionId[curTransactionId] || 0,
                substractedPoints = transactionPointsLeft >= pointsToAllocate ? pointsToAllocate : transactionPointsLeft;

            this._pointsLeftByTransactionId[curTransactionId] = transactionPointsLeft - substractedPoints;
            pointsToAllocate -= substractedPoints;
            adjustments.push({ // TODO: add Adjustment interface
                payer: transaction.payer,
                points: -substractedPoints
            });
            this._balanceByPayer[transaction.payer] -= substractedPoints;
        }

        return adjustments;
    }

    private filterTransactionsForAllocation(transactions: Array<Transaction>, pointsToAllocate: number, timestamp: Date | null = null): Array<Transaction> {
        const transactionsForAllocation: Array<Transaction> = [];

        for (const transaction of transactions) {
            if (timestamp && transaction.timestamp > timestamp) break;

            const transactionPointsLeft = this._pointsLeftByTransactionId[transaction._id] || 0;
            if (transactionPointsLeft > 0) {
                pointsToAllocate -= this._pointsLeftByTransactionId[transaction._id];
                transactionsForAllocation.push(transaction);
            }
            if (pointsToAllocate <= 0) break;
        }
        if (pointsToAllocate > 0) throw new Error(`Not enough points at current time`);

        return transactionsForAllocation;
    }
}

export default new PaymentService();