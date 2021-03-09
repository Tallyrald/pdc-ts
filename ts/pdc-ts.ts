import { spawn } from 'child_process';

export class PdcTs {

	private pandocCommand: string;

	/**
	 * Creates a new Pandoc connector class
	 * @param pandocCommand Command or path for the pandoc runtime (only use if pandoc is not accessible via the standard 'pandoc' command in shell)
	 */
	constructor(pandocCommand: string = 'pandoc') {
		this.pandocCommand = pandocCommand;
	}

	/**
	 * Executes the pandoc conversion.
	 * @param args Argument object
	 * @param args.from A string containing the type of the source text (e.g. 'markdown')
	 * @param args.to A string containing the type of the destination text (e.g. 'html')
	 * @param args.outputToFile Indicates whether the output should be written to file or returned directly
	 * @param args.pandocArgs An array with additional command line flags (e.g.[ '-v' ] for pandoc's version)
	 * @param args.spawnOpts An object with additional options for the process. See the Node.js docs for 'spawn'
	 * @param args.sourceText [Only use either text or file] A string containing the entire source text that shall be converted
	 * @param args.sourceFilePath [Only use either text or file] A file path that will be passed directly to pandoc as input file
	 * @param args.sourceEncoding Encoding of the source text - defaults to utf8 (not applicable if file is used)
	 * @param args.destFilePath A file path that will be passed directly to pandoc as output file
	 * @throws Error if pandoc exits with an error event or an exit code > 0
	 * @returns A string containing the converted text or an empty string if file input was used
	 */
	public async Execute(args: {
		from: string;
		to: string;
		outputToFile: boolean;
		pandocArgs?: string[];
		spawnOpts?: any;
		sourceText?: string;
		sourceFilePath?: string;
		sourceEncoding?: BufferEncoding;
		destFilePath?: string;
	}): Promise<string> {
		return new Promise((resolve, reject) => {
			let pandoc;
			let result = '';
			let error = '';

			if (args.outputToFile && (args.destFilePath == null || args.destFilePath == undefined)) {
				reject('No file destination provided, aborting.')

				return;
			}

			if (args.sourceText) {
				pandoc = this.PdcStream({
					destFilePath: args.destFilePath,
					from: args.from,
					outputToFile: args.outputToFile,
					pandocArgs: args.pandocArgs,
					spawnOpts: args.spawnOpts,
					to: args.to,
				});
			} else if (args.sourceFilePath) {
				pandoc = this.PdcFile({
					destFilePath: args.destFilePath,
					from: args.from,
					outputToFile: args.outputToFile,
					pandocArgs: args.pandocArgs,
					sourceFilePath: args.sourceFilePath,
					spawnOpts: args.spawnOpts,
					to: args.to,
				});
			} else {
				reject('No input, aborting.');

				return;
			}

			// listen on error
			pandoc.on('error', err => {
				reject(err.message);

				return;
			});

			// collect result data
			pandoc.stdout.on('data', data => {
				result += data;
			});

			// collect error data
			pandoc.stderr.on('data', data => {
				error += data;
			});

			// listen on exit
			pandoc.on('close', code => {
				let msg = '';

				if (code !== 0) {
					msg += `Pandoc exited with code ${code}${error ? ': ' : '.'}`;
				}

				if (error) {
					msg += error;
				}

				if (code !== 0) {
					reject(msg);

					return;
				}

				resolve(result);

				return;
			});

			// Finally, send source string if available
			if (args.sourceText) {
				pandoc.stdin.end(args.sourceText, args.sourceEncoding ? args.sourceEncoding : 'utf8');
			}
		});
	}

	/**
	 * Creates a child process for pandoc execution
	 * @param args Argument object
	 * @param args.from A string containing the type of the source text (e.g. 'markdown')
	 * @param args.sourceFilePath Input file path & name
	 * @param args.to A string containing the type of the destination text (e.g. 'html')
	 * @param args.outputToFile Indicates whether the output should be written to file or returned directly
	 * @param args.destFilePath Output file path & name
	 * @param args.pandocArgs array with additional command line flags (e.g.[ '-v' ] for pandoc's version)
	 * @param args.spawnOpts An object with additional options for the process. See the Node.js docs for 'spawn'
	 */
	private PdcFile(args: {
		from: string;
		sourceFilePath: string;
		to: string;
		outputToFile: boolean;
		destFilePath?: string;
		pandocArgs?: string[];
		spawnOpts?: any;
	 }) {
		let inputArgs = [ '-f', args.from, '-t', args.to];
		if (args.outputToFile) {
			inputArgs.push('-o', args.destFilePath);
		}

		inputArgs.push(args.sourceFilePath);

		if (args.pandocArgs !== undefined && args.pandocArgs != null) {
			inputArgs = inputArgs.concat(args.pandocArgs);
		}

		// Start pandoc (with or without options)
		let pandoc;
		if (args.spawnOpts === undefined || args.spawnOpts == null) {
			pandoc = spawn(this.pandocCommand, inputArgs);
		} else {
			pandoc = spawn(this.pandocCommand, inputArgs, args.spawnOpts);
		}

		return pandoc;
	}

	/**
	 * Creates a child process for pandoc execution
	 * @param args Argument object
	 * @param args.from A string containing the type of the source text (e.g. 'markdown')
	 * @param args.to A string containing the type of the destination text (e.g. 'html')
	 * @param args.outputToFile Indicates whether the output should be written to file or returned directly
	 * @param args.destFilePath Output file path & name
	 * @param args.pandocArgs An array with additional command line flags (e.g.[ '-v' ] for pandoc's version)
	 * @param args.spawnOpts An object with additional options for the process. See the Node.js docs for 'spawn'
	 */
	private PdcStream(args: {
		from: string;
		to: string;
		outputToFile: boolean;
		destFilePath?: string;
		pandocArgs?: string[];
		spawnOpts?: any;
	}) {
		let inputArgs = [ '-f', args.from, '-t', args.to ];
		if (args.outputToFile) {
			inputArgs.push('-o', args.destFilePath);
		}

		if (args.pandocArgs !== undefined && args.pandocArgs != null) {
			inputArgs = inputArgs.concat(args.pandocArgs);
		}

		// Start pandoc (with or without options)
		let pandoc;
		if (args.spawnOpts === undefined || args.spawnOpts == null) {
			pandoc = spawn(this.pandocCommand, inputArgs);
		} else {
			pandoc = spawn(this.pandocCommand, inputArgs, args.spawnOpts);
		}

		return pandoc;
	}
}
