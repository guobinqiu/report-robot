// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
$('form').on('submit', e => {
	e.preventDefault()

	let params = $('form').serializeJSON()
	//console.log(params)

	let copyParams = Object.assign({}, params)
	delete copyParams.text

	window.electron.saveSettings(copyParams)

	window.electron.speak(params)
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

$(document).ready(() => {
	let settings = window.electron.getSettings()
	//console.log(settings)
	if (settings) {
		$("input:radio").each(function () {
			if ($(this).val() == settings.per) {
				$(this).prop("checked", true)
			}
		})
		$("input[name='spd']").val(settings.spd)
		$("input[name='pit']").val(settings.pit)
		$("input[name='vol']").val(settings.vol)
	}
})
