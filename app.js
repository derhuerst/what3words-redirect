#!/usr/bin/env node
'use strict'

const http =        require('http')
const url =         require('url')
const request =     require('request')



const key = '5D05GMV7'
const triple = /^\/(\w+)\.(\w+)\.(\w+)$/

const resolve = (key, words, cb) => request(url.format({
	protocol:   'https',
	host:       'api.what3words.com',
	pathname:   '/w3w',
	query: {
		key:    key,
		string: words[1] + '.' + words[2] + '.' + words[3]
	}
}), cb)

const redirect = function (res, lat, long) {
	res.statusCode = 301
	res.setHeader('Location', url.format({
		protocol: 'https',
		host:     'google.com',
		pathname: '/maps',
		query: {
			q:    lat + ',' + long
		}
	}))
}

const app = http.createServer(function (req, res) {
	let match = triple.exec(req.url)
	if (match && match.length === 4) {
		resolve(key, match, function (err, _, body) {
			if (err) { res.statusCode = 500; return res.end(err.message) }
			try { body = JSON.parse(body) }
			catch (err) { res.statusCode = 500; return res.end(err.message) }
			if (body.error) { res.statusCode = 500; return res.end(body.message) }
			redirect(res, body.position[0], body.position[1])
			res.end('done')
		})
	} else {
		res.statusCode = 400
		res.end('invalid word triple')
	}
})
app.listen(8080)
