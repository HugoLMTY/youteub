const express 			= require('express')
const expressLayouts 	= require('express-ejs-layouts')
const bodyParser 		= require('body-parser')

const cors 				= require('cors')
const colors 			= require('colors')

const ytdl 				= require('ytdl-core')

const app 				= express()

var isKlochar = false

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layout/layout')

app.use(expressLayouts)
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	this.isKlochar = false
	res.render('index')
})

app.get('/download', (req, res) => {
	res.render('download', {
		klochar: this.isKlochar
	})
	this.isKlochar = false
})

app.post('/checkLink', async (req, res) => {
	this.isKlochar = false

	const link = req.body.linkInpark.toString()
	const toCheck = [
		'youtube',
		'youtu.be',
		'https://www.youtube.com/watch?v=',
		'https://youtu.be/',
	]

	var url 

	var linkedin = false
	if 		(UCT(link, toCheck, 'includes')) { url = link.split('=')[1] }
	else if (UCT(link.length, [ 11 ], '==')) { url = link } 
	else linkedin = true

	

	if (!linkedin && url) {
		res.redirect('/muzik/' + url)
	} else {
		this.isKlochar = true
		res.redirect('download')
	}
})

app.get('/muzik/:url', (req, res) => {
	// cA sErT a QuOi Le cHeCk LiNk sI t- ftg
	const toCheck = [
		'youtube',
		'youtu.be',
		'https://www.youtube.com/watch?v=',
		'https://youtu.be/',
	]

	const link = req.params.url.split('&')[0]
	const id = UCT(link, toCheck, 'includes')
		? link.split('=')[1]
		: UCT(link.length, [ 11 ], '==')
			? link
			: false
	console.log({ link, id })
	if (!id) { this.isKlochar = true; res.redirect('/download') }

	ytdl.getInfo(id)
	.then(infos => {
		var i = infos.videoDetails
		i['tu'] = i.thumbnails[i.thumbnails.length - 1]

		i['duration'] = i.lengthSeconds > 3600
			? Math.floor(i.lengthSeconds / 3600) + ':' + Math.floor((i.lengthSeconds % 3600) / 60) + ':' + Math.floor(i.lengthSeconds % 60)
			: Math.floor(i.lengthSeconds / 60) + ':' + Math.floor(i.lengthSeconds % 60)

		res.render('muzik', { i })
	})
	.catch(err => {
		console.log({ err })
		this.isKlochar = true 
		res.redirect('/download')
	})
})

app.post('/sup', (req, res) => {
	const link = req.body.url.toString()
	const title = req.body.name.toString()

	res.header('Content-Disposition', `attachment; filename=${title}.mp4`)

	ytdl(link, { format: 'mp4' })
	.pipe(res)

})

const port = 420
app.listen(port, () => {
	console.log(`Server is running on port`.blue, port.toString().rainbow)
	console.log('-->'.blue, `http://localhost:${port}`.rainbow)
})


function UCT(value, options, type) {
	// UCT stands for Ultra Cool Tool
	// But if u read this dont touch my code bro its litteraly gold bro please i swear
	// ik its a shithole leave me alone
	let found = false

	const compare = (value, target) => {
		if (type == '==' 		|| type == 'equal') 			{ return value == target	}
		if (type == '===' 		|| type == 'exact') 			{ return value == target	}
		if (type == '!=' 		|| type == 'different') 		{ return value != target	}
		if (type == '>' 		|| type == 'greater') 			{ return value > target		}
		if (type == '<' 		|| type == 'less') 				{ return value < target		}
		if (type == '>=' 		|| type == 'greaterOrEqual') 	{ return value >= target	}
		if (type == '<=' 		|| type == 'lessOrEqual') 		{ return value <= target	}

		if (type == 'in' 		|| type == 'includes') 			{ return value.includes(target) 	}
		if (type == 'contains' 	|| type == 'contains') 			{ return options.contains(target) 	}
	}

	options.forEach(opt => { if (compare(value, opt)) found = true })
	return found
}