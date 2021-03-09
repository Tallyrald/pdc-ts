import 'mocha';
import * as chai from 'chai';
import * as ChaiAsPromised from 'chai-as-promised';
import { PdcTs } from '../ts/pdc-ts';

chai.use(ChaiAsPromised);
const expect = chai.expect;
const pdcTs = new PdcTs();

describe('Execute function', () => {

	it('should return error if no source is provided', async() => {
		const result = pdcTs.Execute({
            from: 'markdown',
            outputToFile: false,
            to: 'html',
        });
		await expect(result).to.eventually.be.rejected;
	});

    it('should return error if no file destination is provided when requesting file output', async() => {
		const result = pdcTs.Execute({
            from: 'markdown',
            outputToFile: true,
            sourceText: '# Heading',
            to: 'html',
        });
		await expect(result).to.eventually.be.rejected;
	});
});
