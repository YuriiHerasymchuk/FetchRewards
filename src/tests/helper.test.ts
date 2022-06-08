import { uuidRegex, sortTransactions } from '../services/helper';
import { v4 as uuidv4 } from 'uuid';

describe('Helpers',  () => {
    it('matches regex for uuid', () => {
        expect(uuidv4()).toMatch(uuidRegex);
    });
    

    // TODO: test sortTransactions
});