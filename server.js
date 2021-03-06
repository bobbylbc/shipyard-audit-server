const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const config = require('config')
const history = require('connect-history-api-fallback')
const Article = require('./models/Article')
const articleRouter = require('./routes/articles')
const apiRouter = require('./routes/api')

console.debug('config: ', config.get('app'), config.get('db'))
const _appPort = config.get('app.port')
const _dbUrl = config.get('db.url')

const app = express()

mongoose.connect(_dbUrl, {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true
})

app.set('view engine', 'ejs')
app.set('port', _appPort)

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
	const articles = await Article.find().sort({ createdAt: 'desc' })
	res.render('articles/index', { articles })
})

app.use('/articles', articleRouter)
app.use('/api', apiRouter)

// ====== Setup SPA static folder ========
const staticFileMiddleware = express.static('static/www')
app.use(staticFileMiddleware)
app.use(
	history({
		disableDotRule: true,
		index: '/index.html',
		verbose: true,
		logger: console.log.bind(console)
	})
)
app.use(staticFileMiddleware)
// ========================================

app.listen(_appPort, () => {
	console.debug(`App started at port ${_appPort}`)
})
