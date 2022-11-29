// Global objects

const api = new NRFCloudAPI(localStorage.getItem('apiKey'));
let counterInterval;
let requestInterval;
let counter = 0;
let button_pressed = false;
let lastSensorMessage = -1;
var messageReceivedTime;
var doorOpenTime;

// Load devices from nRFCloud api and populate list in settings view
function loadDeviceNames() {
	$('#device-list').empty().append('Oppdaterer...');
	api.devices().then(({ items }) => {
		if (items.length < 1) {
			throw new Error();
		}
		localStorage.setItem('deviceId', 'nrf-352656100749921');
		$('#device-list').empty().append('Sensor funnet');

	})
		.catch(() => $('#device-list').empty().append('Ingen sensor funnet. Sjekk at passordet er riktig'));
}

// Show toast message
function showToast(title, subtitle, content, type, delay) {
	$.toast({ title, subtitle, content, type, delay });
}

// Collection of update functions for different message types of nRFCloud device messages
const updateFunc = {
	DISTANCE: data => {
		lastSensorMessage = Number(new Date());
		if (data >= '1') {
			$('#parking1').text('LEDIG');
		} else {
			$('#parking1').text('FULL');
		}
	},
 	BUTTON: data => {
		 if (data === '1') {
			lastSensorMessage = Number(new Date());
			console.log('Button pressed');
			if (!button_pressed) {
				showToast('','','BUTTON', 'success', 2000); 
				button_pressed = true;
			}
		} 
		else if (data === '0') {
			button_pressed = false;
		}
	},
	TEMP: data => {
		lastSensorMessage = Number(new Date());
		//console.log('Temperature:');
		$('#temperature').text(data);
	},
	VOLTAGE: data => {
		lastSensorMessage = Number(new Date());
		//console.log('Voltage:', data);
		$('#battery').text(data);
	}
}

function orderPizza() {
	$('#trackBtn').text("STATUS")
	// check nRFCloud messages from the device every 1 seconds
	requestInterval = setInterval(async () => {
		const { items } = await api.getMessages(localStorage.getItem('deviceId') || '');
		messageReceivedTime = (items).map(({receivedAt}) => receivedAt)[0];
		(items || [])
		.map(({ message}) => message)
		.forEach(({ appId, data}) => {
			if (!updateFunc[appId]) {
				console.log('unhandled appid', appId, data);
				return;
			}
			
			updateFunc[appId](data);
		});
	}, 2000);

	counterInterval = setInterval(() => {
		if (timeSince(new Date(messageReceivedTime)) !== 'NaN sekunder'){
			//console.log(timeSince(Number(new Date(doorOpenTime))));
			$('#timerSinceLast').text("Siste melding mottatt for " + String(timeSince(new Date(messageReceivedTime))) + " siden");
		}

	}, 100);

}

function timeSince(date) {

	var seconds = Math.floor((new Date() - date) / 1000);
  
	var interval = seconds / 31536000;
  
	if (interval > 1) {
	  return Math.floor(interval) + " år";
	}
	interval = seconds / 2592000;
	if (interval > 1) {
	  return Math.floor(interval) + " måneder";
	}
	interval = seconds / 86400;
	if (interval > 1) {
	  return Math.floor(interval) + " dager";
	}
	interval = seconds / 3600;
	if (interval > 1) {
	  return Math.floor(interval) + " timer";
	}
	interval = seconds / 60;
	if (interval > 1 && interval < 2) {
	  return Math.floor(interval) + " minutt";
	}
	if (interval >= 2) {
		return Math.floor(interval) + " minutter";
	  }
	return Math.floor(seconds) + " sekunder";
  }
  var aDay = 24*60*60*1000;
  var aMinute = 60*60*1000;
  //console.log(timeSince(new Date(Date.now()-aDay)));
  //console.log(timeSince(new Date(Date.now()-aDay*2)));
  //console.log(timeSince(new Date(Date.now()-aMinute)));


// Main function
$(document).ready(() => {
	// Set initial values
	$('#api-key').val(localStorage.getItem('apiKey') || '');
	$('body').tooltip({ selector: '[data-toggle="tooltip"]' });

	// Main logo toggling fullscreen
	$('#mainlogo').click(() => document.documentElement.webkitRequestFullScreen());

	// Tab bar view selector buttons:
	$('.view-btn').click(({ target }) => {
		const id = target.id.replace('Btn', '');

		['splash','track', 'reset', 'settings']
			.filter(key => key !== id)
			.forEach(key => {
				$(`#${key}View`).removeClass('d-flex').addClass('d-none');
				$(`#${key}Btn`).removeClass('text-white').addClass('nrf-light-blue');
			});

		//$(`#${id}Btn`).removeClass('nrf-light-blue').addClass('text-white');
		$(`#${id}View`).removeClass('d-none').addClass('d-flex');

		if (id === 'settings') {
			loadDeviceNames();
			$('#trackBtn').text("START")
		}
	});

	// Settings view, api key change:
	$('#api-key').on('input', () => {
		api.accessToken = $('#api-key').val().trim();
		localStorage.setItem('apiKey', api.accessToken);
		loadDeviceNames();
	});

	// Order view, start ordering:
	$('#trackBtn').click(({ target }) => {
		orderPizza();

	});
});
