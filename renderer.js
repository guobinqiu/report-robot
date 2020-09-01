// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
$('form').on('submit', e => {
	e.preventDefault()

	let token = window.electron.token
	//console.log(token)

	let params = $('form').serializeJSON()
	//console.log(params)

	window.electron.speak(token, params)
})

$('#btn').on('click', () => {
	let audio = document.getElementById('sound')
	if (audio !== null) {
		if (audio.paused) {
			audio.play()
		} else {
			audio.pause()
		}
	}
})
