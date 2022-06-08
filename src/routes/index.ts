import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.send('<h1>Fetch Rewards</h1>');
});

// TODO: some UI interactions with API

export default router;