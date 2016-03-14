#!/usr/bin/env node

child = require('child_process')

const cmd = process.argv[2]

if (cmd === 'start' || cmd === 'stop')
	child.execSync(`npm ${process.argv[2]}`, {
		cwd:   __dirname,
		stdio: [process.stdout, process.stderr]
	})
else process.stdout.write('what3words-redirect <start|stop>\n')
