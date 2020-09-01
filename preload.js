// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }
//
//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })
const {contextBridge, ipcRenderer} = require('electron')
const urlencode = require('urlencode')
const qs = require('qs')
const fs = require('fs')
const path = require('path')

//https://www.npmjs.com/package/axios
const axios = require('axios')

//https://github.com/axios/axios/issues/1474
axios.defaults.adapter = require('axios/lib/adapters/http')

//https://ai.baidu.com/ai-doc/SPEECH/0k38y8mfh
const {apiKey, secretKey} = require('./config')
let authUrl = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=" + apiKey + "&client_secret=" + secretKey

axios.get(authUrl).then(resp => {
	//handle success
	let token = resp.data.access_token
	//console.log(token)

	//window.ipcRenderer = require('electron').ipcRenderer

	contextBridge.exposeInMainWorld('electron', {
		ipcRenderer: ipcRenderer,
		token: token,
		speak: (token, params) => {
			//下载的文件格式, 3：mp3(default) 4： pcm-16k 5： pcm-8k 6. wav
			const aue = 3

			let formats = new Map()
			formats.set(3, 'mp3')
			formats.set(4, 'pcm')
			formats.set(5, 'pcm')
			formats.set(6, 'wav')

			params['aue'] = aue
			params['cuid'] = '123456Nodejs'
			params['tex'] = urlencode(params['text'])
			params['tok'] = token
			params['lan'] = 'zh' //固定参数
			params['ctp'] = 1 // 固定参数
			//console.log(params)

			//https://ai.baidu.com/ai-doc/SPEECH/0k38y8mfh
			const $url = 'http://tsn.baidu.com/text2audio'
			return axios.post($url, qs.stringify(params), {
				responseType: 'stream',
			}).then(resp => {
				if (resp.headers['content-type'].startsWith("audio/")) {
					let filePath = path.join(__dirname, 'result.' + formats.get(aue))
					console.log(filePath)

					let ws = fs.createWriteStream(filePath)
					resp.data.pipe(ws)
					ws.on('finish', () => {
						let audio = document.getElementById('sound')
						if (audio !== null) {
							//audio.src = filePath
							audio.src = filePath + "?cb=" + new Date().getTime()
							audio.load()
							audio.play()
						}
					})
				}
			}).catch(err => {
				console.log(err)
			})
		},
	})
}).catch(err => {
	//handle error
	console.log(err)
})
