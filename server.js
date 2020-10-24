const path = require("path")
const jsonServer = require("json-server")
const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, "db.json"))
const middlewares = jsonServer.defaults()
const key = process.env.KEY || 'key'

server.use(jsonServer.rewriter({
	'/api/:id/comment': '/pages/:id/comments',
	'/api/:id': '/pages/:id',
	'/api': '/pages?_limit=200'
}))
server.use(jsonServer.bodyParser)
server.use(middlewares)
server.use((req, res, next) => {
	res.headers.dirrr = __dirname
	console.log(__dirname)
	next()
})

server.use(router)

server.listen(3000, () => console.log(middlewares))
