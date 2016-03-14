#!/usr/bin/env node
'use strict'

const config =      require('config')
const http =        require('http')
const url =         require('url')
const cors =        require('cors')
const w3w =         require('geo.what3words')(config.key)



const triple = /^\/(\w+)\.(\w+)\.(\w+)$/

const sendCors = cors()

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
	if (!match || match.length !== 4) return error(res, 400, 1, 'invalid word triple')

	w3w.wordsToPosition({
		words: match.slice(1, 4)
	})
	.catch((err) => error(res, 500, 2, err.message))
	.then(function (position) {
		position = position.split(',')
		redirect(res, position[0], position[1])
		res.end(JSON.stringify({error: false}))
	})
})
app.listen(8080)
