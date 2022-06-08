import express, { Express, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import paymentService from '../../services/payment_service';
import Transaction, { createTransaction } from '../../models/transaction';

const router = express.Router();

// TODO: write unit tests for API endpoints

router.get('/transactions', (_, res) => {
    res.json(paymentService.transactions);
});

router.get('/balance', (_, res) => {
    res.json(paymentService.balance);
});

router.post(
    '/transaction',
    body('payer').isString(),
    body('timestamp').isString(),
    body('points').isInt(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { payer, timestamp }: { payer: string, timestamp: string } = req.body;
        const points = parseInt(req.body.points);

        try {
            const transaction = paymentService.addTransaction(createTransaction(payer, points, timestamp));
            res.json({ ...transaction });
        } catch (err) {
            console.error(err);
            // TODO: handle error messages for response
            res.status(500).json({ status: 'error' });
        }
    }
);

router.post('/transactions', (req, res) => {
    try {
        // TODO: write transactions validation instead of asserting and catching errors
        const transactions = (req.body as Array<Transaction>).map(({ payer, points, timestamp }) => createTransaction(payer, points, timestamp));

        const savedTransactions = paymentService.addTransactions(transactions);
        res.json(savedTransactions);
    } catch (err) {
        console.error(err);
        // TODO: handle error messages for response
        res.status(500).json({ status: 'error' });
    }
});

router.post(
    '/points/spend',
    body('points').isInt(),
    (req, res) => {
        const points = parseInt(req.body.points);

        try {
            const result = paymentService.spendPoints(points);
            res.json(result);
        } catch (err) {
            console.error(err);
            // TODO: handle error messages for response
            res.status(500).json({ status: 'error' });
        }
    }
);

export default router;