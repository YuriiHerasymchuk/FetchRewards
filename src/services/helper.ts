import Transaction from '../models/transaction';

export const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const sortTransactions = (transactions: Array<Transaction>) =>
    transactions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());