#!/usr/bin/env node
'use strict'

const http =        require('http')
const url =         require('url')
const cors =        require('cors')
const request =     require('request')



const key = '5D05GMV7'
const triple = /^\/(\w+)\.(\w+)\.(\w+)$/

const sendCors = cors()

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
	res.setHeader('Locatio', url.format({
		protocol: 'https',
		host:     'google.com',
		pathname: '/maps',
		query: {
			q:    lat + ',' + long
		}
	}))
}

const error = function (res, status, code, message) {
	res.statusCode = status
	res.end(JSON.stringify({
		error: code,
		message
	}))
}



const app = http.createServer(function (req, res) {
	sendCors(req, res, () => {})
	let match = triple.exec(req.url)
	if (match && match.length === 4) {
		resolve(key, match, function (err, _, body) {
			if (err) return error(res, 500, 2, err.message)
			try { body = JSON.parse(body) }
			catch (err) { return error(res, 500, 3, err.message) }
			if (body.error) { return error(res, 500, 4, body.message) }

			redirect(res, body.position[0], body.position[1])
			res.end(JSON.stringify({error: false}))
		})
	} else error(res, 400, 1, 'invalid word triple')
})
app.listen(8080)
