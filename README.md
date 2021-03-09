# Pdc-ts

Pandoc wrapper for Typescript applications running on NodeJS

## Installation

~~~bash
npm install pdc-ts
~~~

This package requires [pandoc](http://johnmacfarlane.net/pandoc/) to be
installed. By default, the wrapper assumes pandoc to be in `PATH`. To override this, see usage below.

## Usage

~~~typescript
import { PdcTs } from 'pdc-ts';

// Optional, if pandoc is not in PATH
const path = '/path/to/pandoc';
const pdcTs = new PdcTs(path);

// Now specify the details & execute
const result: string = await pdcTs.Execute({
    from: 'markdown', // pandoc source format
    to: 'html', // pandoc output format
    outputToFile: false, // Controls whether the output will be returned as a string or written to a file
    pandocArgs?: ['-v'], // pandoc arguments (any arguments you might want to pass to pandoc)
    spawnOpts?: {}, // NodeJS spawn options (leave empty if you don't know what this is)
    sourceText?: '# Heading', // Use this if your input is a string. If you set this, the file input will be ignored
    sourceFilePath?: '/some/path/to/some/file', // Use this is your input is a file. Only works if no string input was given
    sourceEncoding?: 'utf8', // Defaults to utf8
    destFilePath?: '/some/path/to/some/output' // This will be the output file destination if outputToFile is true
});
~~~

The result will either be a string containing the converted document or an empty string if you asked for a file as output. You can control this using the outputToFile boolean.

## Credits

Thank you to [John MacFarlane](http://johnmacfarlane.net/) for creating
[Pandoc](https://pandoc.org/) & [Paul Vorbach](https://paul.vorba.ch/) for the [original pdc wrapper](https://github.com/pvorb/node-pdc) I used as a basis for the Typescript version.

## License

MIT
