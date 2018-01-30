// MGS1 = 15512
// MGS2 = 11471
// MGS3 = 227
// MGS4 = 11783
// MGSPO = ???
// FOX Unit history

var currentGame = '15512'
var currentCodec = '';

/* To create the bar effect */
var iniWidth = 100;
var barWidth = $('#bars-con').children();
for (var increaseWidth = 1; increaseWidth < (barWidth.length + 1); increaseWidth++) {
	$('#bars-con').children().eq(increaseWidth - 1).css('width', iniWidth + (25 * (barWidth.length - increaseWidth)) + 'px');
}

// To create the 'bar' color changing effect
var bSignal = barWidth.length
var signalCount = bSignal;
var dBar = true;
function barSignal() {

	setTimeout(function() {
		if (dBar === true) {
			signalCount--;
			$('#bars-con').children().eq(signalCount).css('background-color', '#03FB8D');
			if (signalCount === 0) {
				dBar = false;
				console.log(signalCount);
			}
		} else {
			signalCount++;
			$('#bars-con').children().eq(signalCount).css('background-color', '#397975');

			if (signalCount === bSignal) {
				dBar = true;
				//return false
			}
		}

		barSignal();
	}, 150)
};

//barSignal();

/* How the codec works

	You press the arrows < > to change freq, each setting will have its own set of frequencies (i.e, MGS: 140.15, 140.48...)
	Each time you'll get a random conversation picked randomly from the codec object
	After the conversation ahs ended, static will be displayed on the images, and a message will appear saying that the conversation has ended

*/

var games = {
	'227': { /* CHANGE */
		'frequencies': ['140.15', '140.48', '140.96', '140.85', '141.52', '141.12', '141.80']
	},
	'11471': { /* CHANGE */
		'frequencies': ['140.15', '140.48', '140.96', '140.85', '141.52', '141.12', '141.80'],
		'gallery': '150'
	},
	'15512': {
		'frequencies': ['140.15', '140.48', '140.96', '140.85', '141.52', '141.12', '141.80'],
		'gallery': '149'
	},
	'11783': {
		'frequencies': ['140.15', '140.48', '140.96', '140.85', '141.52', '141.12', '141.80']
	}
}

$.ajax('https://metalgear.wikia.com/api.php?format=json&action=query&prop=revisions&rvprop=content&pageids=' + currentGame + '&rvparse=1', { // Add &rvparse=1 for html response
	dataType: 'jsonp'
}).done(function (data) {
	console.log(data);
	/* How codec(s) should be stored

	var codec = {
		'Snake finds food': {
			characters = ['Snake', 'Major', 'Para-Medic']
			conversations = [
				['Major', 'Snake, did you find food? '],
				['Snake', 'Yeah.' ],
				['Para-Medic', 'You sound happy.'],
			]
		}

	} */

	var codec = {}
	var characters = [];
	var cImages;

	// Change the freq header innerHTML to first index of the frequencies array in the games object

	var freqCount = 0;
	function currentFreq(freq) {
		document.querySelector('#freq').innerHTML = freq
	}

	currentFreq(games[currentGame]['frequencies'][freqCount])


	// Get the text
	var text = data.query.pages[Object.keys(data.query.pages)[0]].revisions[0]['*']

	// Get all headers
	/* Headers are within three equal signs '=== Snake finds food ==='
		I should get the first occurrence, and the second, then repeat
	*/
	var dDiv = document.querySelector('#dummy-div');
	dDiv.innerHTML = text;

	var headers = dDiv.querySelectorAll('h3');
	var topics = [];

	// Get all the <i> tags
	var iRobot = dDiv.querySelectorAll('i');

	// Removes those <i> tags that contain a specific string
	for (var d = 0; d < iRobot.length; d++) {
		if (iRobot[d].textContent.includes('To initiate this conversation') === true || iRobot[d].textContent.includes('To unlock this conversation') === true || iRobot[d].textContent.includes('To obtain this conversation') === true) { // Make this smaller [[In order to access this conversation
			iRobot[d].parentNode.removeChild(iRobot[d]);
		}
	}


	// Get all the 'headers' (Conversation topics)
	for (var i = 0; i < headers.length; i++) {
		var x = headers[i].querySelectorAll('span')[0].innerHTML
		topics.push(x);
		codec[x] = { 'characters': [], 'conversations': [] }

		var headerConvo = $( headers[i] ).nextUntil( headers[i + 1] )
		for (var m = 0; m < headerConvo.length; m++) {
			//codec[x]['conversations'].push(headerConvo[m].innerHTML)

			// Get characters within <b> tags
			if (headerConvo[m].querySelectorAll('b').length > 0) {
				var chars = headerConvo[m].querySelectorAll('b')
				// Get all the characters
				var b = headerConvo[m].querySelectorAll('b')[0].innerHTML.replace(/[$/:-?{-~!"^_`'\[\]]/g, '');
				// Remove space at the end of the string
				if (b[b.length - 1] == ' ') {
					b = b.slice(0, -1)
				}

				if (characters.includes(b) !== true) { // Check what to parse and make a comment for it
					characters.push(b);
				}
			}

			if (headerConvo[m].querySelectorAll('b').length > 0) {
				// Does it have <b> as a child?
				try {
					var convo = headerConvo[m].removeChild(headerConvo[m].querySelectorAll('b')[0]);
				}
				catch(error) {
					console.log('Could not find <b>!');
				}
				//console.log(convo);
			}

			if (headerConvo[m].textContent.replace(/\r?\n|\r/g, '') !== '') {
				codec[x]['conversations'].push([b, headerConvo[m].textContent.replace(/\r?\n|\r/g, '')]) // Character
				
				if (codec[x]['characters'].indexOf(b) === -1) {
					codec[x]['characters'].push(b);
				};		
			}
		}
	}

	var count = 0;
	function currentConversation(click) {
		if (Object.values(click)[0] === true) {
			if (count !== currentCodec.length) {
				count++;
			}
		} else {
			count = 0;
		}
		// if length is max > next click will be 'end transmission'
		console.log(currentCodec);
		if (currentCodec[count] !== undefined) {
			document.querySelector('#text').innerHTML = currentCodec[count][1];
			if (currentCodec[count][0].indexOf('Snake') === -1) {
				$('#char-1').css('background-image', 'url(' + cImages[currentCodec[count][0]].image + ')');
			}
			
			$('#c-char').text(currentCodec[count][0] + ':');
			$('#char-2').css('background-image', 'url(' + cImages['Snake'].image + ')');
		} else {
			document.querySelector('#text').innerHTML = '*END TRANSMISSION*';
			$('#c-char').text('');
			$('.char-box').css('background-image', 'url("Images/static.gif")');
		}
	};

	document.querySelector('#text-con').addEventListener('click', currentConversation);

	/* For when the arrow(s) are clicked */
	function changeFreq() {
		var id = this.getAttribute("id");

		if (id === 'right') {
			// If reached max freq index
			if (freqCount === games[currentGame]['frequencies'].length - 1) {
				freqCount = 0;
			} else {
				freqCount++;
			}
			currentFreq(games[currentGame]['frequencies'][freqCount])
		} else {
			// as above, so below
			if (freqCount === 0) {
				freqCount = games[currentGame]['frequencies'].length - 1;
			} else {
				freqCount--;
			}
			currentFreq(games[currentGame]['frequencies'][freqCount])
		}

		// get random codec conversation from codec object
		var codecL = Object.keys(codec);
		var rNum = Math.floor(Math.random() * (codecL.length - 0) + 0);
		currentCodec = codec[codecL[rNum]]['conversations'];
		currentConversation(false)
	}

	console.log(codec);
	// Get the character image(s)
	function getImages(id) {
		$.ajax('https://metalgear.wikia.com/api.php?format=json&action=query&prop=revisions&rvprop=content&pageids=' + id + '&rvparse=1', { // Add &rvparse=1 for html response
			dataType: 'jsonp'
		}).done(function (nData) {
			console.log(nData);
			var text2 = nData.query.pages[Object.keys(nData.query.pages)[0]].revisions[0]['*']
			var dDiv2 = document.querySelector('#dummy-div_2');
			dDiv2.innerHTML = text2;
			var characterImages = {};
			
			// lightbox-caption div contains the name(s) of the images
			$('.lightbox-caption').each(function() {
				var linkOf = $(this).siblings('.thumb').find('img').attr('data-src');
				linkOf = linkOf.replace('/scale-to-width-down/', '');
				var x1 = linkOf.lastIndexOf('latest'); var x2 = linkOf.lastIndexOf('?');
				linkOf = linkOf.substring(0, x1 + 'latest'.length) + linkOf.substring(x2, linkOf.length);
				
				console.log($(this).children('a').text());
				if (characters.indexOf($(this).children('a').text()) > -1) {
					characterImages[characters[characters.indexOf($(this).children('a').text())]] = { 'image': linkOf }
					if ($(this).children('a').text() === 'Solid Snake') {
						characterImages['Snake'] = { 'image': linkOf }
					} else if ($(this).children('a').text() === 'Roy Campbell') {
						characterImages['Campbell'] = { 'image': linkOf }
					} else if ($(this).children('a').text() === 'Nastasha Romanenko') {
						characterImages['Nastasha Romenanko'] = { 'image': linkOf }
						characterImages['Nastaha Romanenko'] = { 'image': linkOf }
						characterImages['Nastasha Romenenko'] = { 'image': linkOf }
					} else if ($(this).children('a').text() === 'Naomi Hunter') {
						characterImages['Naomi'] = { 'image': linkOf }
					};
				} else {
					//console.log('Couldn\'t find ' + $(this).children('a').text() + '!');
					if ($(this).children('a').text() === 'Hal Emmerich') { 
						characterImages['Otacon'] = { 'image': linkOf }
					}
					
					if (characters.indexOf($(this).children('a').text().split(' ')[0]) > -1) {
						characterImages[characters[characters.indexOf($(this).children('a').text().split(' ')[0])]] = { 'image': linkOf }
					};
				}
			});
			
			console.log(characterImages);
			
			var arrows = document.querySelectorAll('.arrow')

			for (var addEvent = 0; addEvent < arrows.length; addEvent++) {
				arrows[addEvent].addEventListener('click', changeFreq);
			}
			
			cImages = characterImages;
		});
	};
	
	getImages(games[currentGame].gallery);
	console.log(characters);
});
