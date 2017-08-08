var MINI = require('minified'),	$ = MINI.$, _ = MINI._;

MINI.M.prototype.children = function (){
	return $('*', this, true);
};

$(function () {
	var tplUser = '{{each}}<div data-username="{{this.username}}" class="panel-block notification is-marginless"><article class="media"><figure class="media-left"><p class="image is-64x64"><img class="is-rounded" src="{{this.avatar}}"></p></figure><div class="media-content"><div class="content"><p><a href="https://www.twitch.tv/{{this.username}}" target="_blank"><strong>{{this.name}}</strong><br><strong>NOW:</strong> <em class="datastream">Offline</em></a></p></div></div></article></div>{{/each}}',
			users = _("freecodecamp", "ESL_SC2", "OgamingSC2"),
			apiTwitch = 'https://wind-bow.glitch.me/twitch-api/';

	var userList = [], streams = [];
	$('.search').set('value', null);

	/* GET info from users */
	users.map(function (user) {
		return $.request('GET', apiTwitch + 'users/' + user)
		.then(function (text) {
			return $.parseJSON(text);
		});
	}).each(function (p) {
		p.then(function (datauser) {
			var userinfo = {};

			userinfo['avatar'] = datauser.logo;
			userinfo['name'] = datauser.display_name;
			userinfo['channel'] = datauser._links.self;
			userinfo['username'] = datauser.name;

			userList.push(userinfo);

			return userList;
		}).then(function (userList) {
			$('#userlist').ht(tplUser, userList);
		});
	});

	/* GET info from streaming (if available) */
	users.map(function (user) {
		return $.request('GET', apiTwitch + 'streams/' + user)
		.then(function (text) {
			return $.parseJSON(text);
		});
	}).each(function (p) {
		p.then(function (datastream) {
			var url = datastream._links.channel.split('/');
			var userdata = {};

			userdata['name'] = url[url.length - 1].toLowerCase();
			userdata['online'] = Boolean(datastream.stream);
			userdata['datastream'] = userdata['online'] ? datastream.stream.channel.status : '';

			return userdata;
		}).then(function (userdata) {

			var streamingElement = $('.panel-block').only(function (element) {
				return $(element).get('%username') === userdata['name'] && userdata['online'];
			});

			$(streamingElement).set('+is-primary');

			$(streamingElement).children().children()
				.only(1)
				.children().children().children().children()
				.only(3)
				.fill(userdata['datastream']);
		}).then(function () {
			$('.loader').hide();
		});
	});

	$('.panel-tabs a').onClick(function (event) {
		$('.panel-tabs a').set('-is-active');
		$(event.target).set('+is-active');
	});

	$('#reset').onClick(function (event) {
		$('#userlist .panel-block').show();
	});

	$('#online').onClick(function (event) {
		$('#userlist .panel-block').show();
		$('#userlist .panel-block').not('.is-primary').hide();
	});

	$('#offline').onClick(function (event) {
		$('#userlist .panel-block').show();
		$('#userlist .panel-block.is-primary').hide();
	});

	$('.search').onChange(function (event) {
		if ($(this).get('value')) {
			$('#userlist .panel-block').hide();

			var pattern = $(this).get('value');
			var regex = new RegExp(pattern, 'gi');

			$('#userlist .panel-block').only(function (element) {
				var tester = $(element).get('%username');
				return regex.test(tester);
			}).show();
		} else {
			$('#userlist .panel-block').show();
		}
	});

});