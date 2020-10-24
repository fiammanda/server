const path = require("path")
const static = require("serve-static")
const jsonServer = require("json-server")
const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, "db.json"))
const middlewares = jsonServer.defaults()
const key = process.env.KEY || 'key'
const whitelist = [
	"localhost:3000",
	"fiammanda.github.io",
	"fiammanda.gitee.io",
	"api.fiammanda.vercel.app"
]

server.use(static(path.join(__dirname, "public")))
server.use(jsonServer.rewriter({
	"/admin/": "/admin.html",
	"/api/:id/comment": "/pages/:id/comments",
	"/api/:id": "/pages/:id",
	"/api": "/pages?_limit=200"
}))
server.use(jsonServer.bodyParser)
server.use(middlewares)
server.use((req, res, next) => {
	console.log(req.url)
	if (!whitelist.includes(req.headers['host'])) {
		res.status(403)
		throw 'Domain not whitelisted.'
	} else if (req.headers['key'] !== key) {
		if (req.method === 'PUT' || req.method === 'DELETE' || req.url === '/db' || req.url.indexOf('_embed=comments') > 0) {
			res.status(403)
			throw 'Request not authorized.'
		}
	}
	next()
})
server.post('/comments', (req, res, next) => {
	req.body.time = req._startTime
	req.body.ua = req.ip
	req.body.ip = req.headers['user-agent']
	next()
})

router.render = (req, res) => {
	if (req._parsedOriginalUrl._raw === '/api') {
		let data = {};
		res.locals.data.forEach(datum => {
			data[datum.url] = {
				id: datum.id,
				like: datum.like,
				view: datum.pv
			}
		})
		res.jsonp(data)
	} else if (req.url.indexOf('/comments') == 0) {
		if (Array.isArray(res.locals.data)) {
			res.locals.data.forEach(datum => {
				delete datum.mail
				delete datum.ip
				delete datum.ua
			})
		} else {
			delete res.locals.data.mail
		}
		res.jsonp(res.locals.data)
	} else {
		res.jsonp(res.locals.data)
	}
}
server.use(router)

server.listen(3000, () => console.log("JSON Server is running"))
