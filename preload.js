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
//https://www.electronjs.org/docs/api/context-bridge
const {contextBridge, ipcRenderer, remote} = require('electron')

//https://www.npmjs.com/package/urlencode
const urlencode = require('urlencode')

//https://www.npmjs.com/package/qs
const qs = require('qs')

const fs = require('fs')
const path = require('path')

//https://www.npmjs.com/package/axios
const axios = require('axios')

//https://github.com/axios/axios/issues/1474
axios.defaults.adapter = require('axios/lib/adapters/http')

//Get global vars
const token = remote.getGlobal('token')
const store = remote.getGlobal('store')

//window.ipcRenderer = require('electron').ipcRenderer
contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: ipcRenderer,
	getSettings: () => {
		return store.get('settings')
	},
	saveSettings: (settings) => {
		store.set('settings', settings)
	},
	speak: (params) => {
		//3：mp3(default) 4： pcm-16k 5： pcm-8k 6. wav
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
		params['lan'] = 'zh' //fixed parameter
		params['ctp'] = 1 //fixed parameter
		//console.log(params)

		//https://ai.baidu.com/ai-doc/SPEECH/0k38y8mfh
		const $url = 'http://tsn.baidu.com/text2audio'
		return axios.post($url, qs.stringify(params), {//convert {foo: bar} to foo=bar
			responseType: 'stream',
		}).then(resp => {
			if (resp.headers['content-type'].startsWith("audio/")) {
				let filePath = path.join(__dirname, 'result.' + formats.get(aue))
				//console.log(filePath)

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
