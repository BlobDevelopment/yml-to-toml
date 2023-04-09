#!/usr/bin/env node

import * as fs from 'fs/promises';
import { argv, exit } from 'process';
import yaml from 'yaml';
import { stringify } from '@iarna/toml';
import { resolve } from 'path';

async function main() {
	if (argv.length <= 2) {
		console.log('Usage: yml-to-toml <file>');
		exit(1);
	}

	const file = argv[2];
	const path = resolve(file);	

	// Check if file exists
	if (!await fileExists(path)) {
		console.error('Error: File does not exist!');
		exit(1);
	}

	// Parse to YAML
	let obj;
	try {
		obj = yaml.parse(await fs.readFile(path, { encoding: 'utf8' }));
	} catch(e) {}

	if (typeof obj != 'object' || Array.isArray(obj)) {
		console.error('Error: Failed to parse YAML file! Is it valid YAML?');
		exit(1);
	}

	// Convert to TOML
	const toml = stringify(obj);

	// Write file
	let fileName = file;
	if (fileName.includes('.')) {
		fileName = file.substring(0, file.lastIndexOf('.'));
	}
	fileName = fileName + '.toml';

	await fs.writeFile(resolve(fileName), toml, { encoding: 'utf8' });

	console.log(`Converted ${file} to ${fileName}`);
}

async function fileExists(path: string): Promise<boolean> {
	try {
		const stat = await fs.lstat(path);
		return stat && stat.isFile();
	} catch(e) {
		return false;
	}
}

main();
