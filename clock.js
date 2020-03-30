document.body.insertAdjacentHTML('afterbegin', '<div id="watch-service-online" onclick="window.open(\'https://greenhousesouthflorida.online.church/\', \'_blank\');"><div id="service-countdown"><div id="service-countdown-label"><span class="watch-online">Watch Service Online!</span><span class="starting-soon between-services">Service is Starting Soon!</span><span class="service-countdown-label-subtitle"><span class="watch-online">Join us Sunday at 9:30 AM or 11:30 AM</span><span class="starting-soon">Join us <span class="emphasis">online</span> at 9:30 AM or 11:30 AM</span><span class="between-services">Join us <span class="emphasis">online</span> at 11:30 AM</span></span></div><div id="service-countdown-timer"><span id="service-countdown-timer-days" class="service-countdown-timer-unit" data-label="Days"></span><span id="service-countdown-timer-hours" class="service-countdown-timer-unit" data-label="Hrs"></span><span id="service-countdown-timer-minutes" class="service-countdown-timer-unit" data-label="Mins"></span><span id="service-countdown-timer-seconds" class="service-countdown-timer-unit" data-label="Secs"></span></div></div><div id="service-watch"><div id="service-watch-text"><span class="is-starting">Service is Starting!</span><span class="has-started">Service Has Started!</span><span class="service-watch-label-subtitle">Join us <span class="emphasis">online</span></span></div><span id="service-watch-cta">Watch Now<i class="fa fa-play-circle" aria-hidden="true" style="margin-left: 8px;"></i></span></div>');
// declare hasParam and getParam functions if not pre-defined
function hasParam(param) { return (new URLSearchParams(location.search)).has(param); }
function getParam(param) { return (new URLSearchParams(location.search)).get(param); }
// execute scripts after once element loads :: waitForElement(selector).then(function(element) {})
function waitForElement(selector) {
	return new Promise(function(resolve, reject) {
		var element = document.querySelector(selector);
		if (element) {
			resolve(element);
			return;
		}
		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var nodes = Array.from(mutation.addedNodes);
				if (nodes !== undefined) {
					for (var i = 0; i < nodes.length; i++) {
						var node = nodes[i];
						if (node.matches && node.matches(selector)) {
							observer.disconnect();
							resolve(node);
							return;
						}
					}
				}
			});
		});
		observer.observe(document.documentElement, {
			childList: true,
			subtree: true
		});
	});
}
// document.addEventListener('DOMContentLoaded', function(){
	// get the current datetime from a specific timezone by UTM offset
	function timezoneDate(offset, date = (new Date())) {
		var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
		return (new Date(utc + (3600000*offset)));
	}
	// change the state of the countdown header
	function watchOnlineStateChange(state) {
		if (document.getElementById('watch-service-online').getAttribute('data-state') != state) {
			document.getElementById('watch-service-online').setAttribute('data-state', state);
		}
	}
	// get a date object of the next instance of a particular weekday (e.g. "the next Sunday")
	function getNextDayOfWeek(dayOfWeek, date = (new Date())) {
		date = timezoneDate(-4, date);
		var daysOfWeek1 = ["u","m","t","w","r","f","s"];
		var daysOfWeek = ["su","mo","tu","we","th","fr","sa"];
		if (typeof dayOfWeek == "string" && dayOfWeek.length > 0 && (daysOfWeek1.includes(dayOfWeek.slice(0,1).toLowerCase()) || daysOfWeek.includes(dayOfWeek.slice(0,2).toLowerCase()))) {
			if (dayOfWeek.length == 1) {
				dayOfWeek = daysOfWeek1.indexOf(dayOfWeek.slice(0,1).toLowerCase());
			} else {
				dayOfWeek = daysOfWeek.indexOf(dayOfWeek.slice(0,2).toLowerCase());
			}
		} else if (typeof dayOfWeek == "number" && Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6) {
			// valid integer value passed, continue running
		} else {
			console.error(dayOfWeek+" is not a valid value. Please pass an integer 0-6 or a day of the week U/Sun/Sunday");
			return false;
		}
		var resultDate = new Date(date.getTime());
		resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
		return resultDate;
	}
	var now = timezoneDate(-4);
	var nowDecimal = now.getHours()+((now.getMinutes()+(now.getSeconds()/60))/60);
	Number.prototype.addHrs  = function(e) { return this + e; };
	Number.prototype.addMins = function(e) { return this + (e/60); };
	Number.prototype.addSecs = function(e) { return this + (e/3600); };
	var preServiceDuration = 10; // length of previews before service (in minutes)
	var lengthOfService = 50; // duration of service (in minutes)
	var schedule = {
		day: 0,
		preDuration: 10,
		duration: 50,
		services: [
			{
				start: 9.5,
				get preStart() { return this.start - (schedule.preDuration/60); },
				get end() { return this.start + (schedule.duration/60); }
			}, {
				start: 11.5,
				get preStart() { return this.start - (schedule.preDuration/60); },
				get end() { return this.start + (schedule.duration/60); }
			}
		],
	};
	if (hasParam('test') && getParam('test') == "schedule") {
		schedule = "";
		schedule = {
			day: now.getDay(),
			services: [
				{
					preStart: nowDecimal.addSecs(10),
					start: nowDecimal.addSecs(20),
					end: nowDecimal.addSecs(30)
				}, {
					preStart: nowDecimal.addSecs(50),
					start: nowDecimal.addSecs(60),
					end: nowDecimal.addSecs(70)
				}
			],
		};
	}
	var countdownLoop = setInterval(function() {
		var now = timezoneDate(-4);
		var nowDecimal = now.getHours()+((now.getMinutes()+(now.getSeconds()/60))/60);
		// animating banner to NOT sticky
		if ((now.getDay() > 0 || (now.getDay() == 0 && nowDecimal >= schedule.services[1].end)) || (now.getDay() == 0 && nowDecimal < schedule.services[0].preStart) || (now.getDay() == 0 && nowDecimal >= schedule.services[0].end && nowDecimal < schedule.services[1].preStart)) {
			let isAnimating = false;
			if (window.getComputedStyle(document.getElementById('watch-service-online')).getPropertyValue('position') == "sticky" && ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop) > document.getElementById('watch-service-online').offsetHeight) {
				isAnimating = true;
				document.getElementById('watch-service-online').style.transition = "transform 0.25s ease-in-out";
				document.getElementById('watch-service-online').style.transform = "translateY(0)";
				document.getElementById('watch-service-online').style.position = "sticky";
			}
			if (now.getDay() > 0 || (now.getDay() == 0 && nowDecimal >= schedule.services[1].end)) {
				if (now.getDay() > 0) {
					var dateTill = (new Date(getNextDayOfWeek("Sun").setHours(9,30,0,0)));
				} else if (now.getDay() == 0 && nowDecimal >= schedule.services[1].end) {
					var dateTill = (new Date(((new Date(getNextDayOfWeek("Sun").setHours(9,30,0,0)))).setDate((new Date(getNextDayOfWeek("Sun").setHours(9,30,0,0))).getDate() + 7)));
				}
				if (!isAnimating) { watchOnlineStateChange('watch-online'); } else { setTimeout(function() { watchOnlineStateChange('watch-online'); }, 350); }
			} else if (now.getDay() == 0 && nowDecimal < schedule.services[0].preStart) {
				var dateTill = (new Date(getNextDayOfWeek("Sun").setHours(9,30,0,0)));
				if (!isAnimating) { watchOnlineStateChange('starting-soon'); } else { setTimeout(function() { watchOnlineStateChange('starting-soon'); }, 350); }
			} else if (now.getDay() == 0 && nowDecimal >= schedule.services[0].end && nowDecimal < schedule.services[1].preStart) {
				var dateTill = (new Date(getNextDayOfWeek("Sun").setHours(11,30,0,0)));
				if (!isAnimating) { watchOnlineStateChange('between-services'); } else { setTimeout(function() { watchOnlineStateChange('between-services'); }, 350); }
			}
			if (isAnimating) {
				setTimeout(function() {
					document.getElementById('watch-service-online').style.transform = "translateY(-"+document.getElementById('watch-service-online').offsetHeight+"px)";
				}, 300);
			}
			setTimeout(function() {
				document.getElementById('watch-service-online').style.transform = "translateY(0)";
				document.getElementById('watch-service-online').style.transition = "";
				document.getElementById('watch-service-online').style.position = "";
			}, 550);
		}
		// animating banner to NOT sticky
		else if ((now.getDay() == 0 && ((nowDecimal >= schedule.services[0].preStart && nowDecimal < schedule.services[0].start) || (nowDecimal >= schedule.services[1].preStart && nowDecimal < schedule.services[1].start))) || (now.getDay() == 0 && ((nowDecimal >= schedule.services[0].start && nowDecimal < schedule.services[0].end) || (nowDecimal >= schedule.services[1].start && nowDecimal < schedule.services[1].end)))) {
			let isAnimating = false;
			if (window.getComputedStyle(document.getElementById('watch-service-online')).getPropertyValue('position') != "sticky" && ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop) > document.getElementById('watch-service-online').offsetHeight) {
				isAnimating = true;
				document.getElementById('watch-service-online').style.transition = "transform 0s ease-in-out";
				document.getElementById('watch-service-online').style.transform = "translateY(-"+document.getElementById('watch-service-online').offsetHeight+"px)";
				document.getElementById('watch-service-online').style.position = "sticky";
			}
			if (now.getDay() == 0 && ((nowDecimal >= schedule.services[0].preStart && nowDecimal < schedule.services[0].start) || (nowDecimal >= schedule.services[1].preStart && nowDecimal < schedule.services[1].start))) {
				watchOnlineStateChange('is-starting');
			} else if (now.getDay() == 0 && ((nowDecimal >= schedule.services[0].start && nowDecimal < schedule.services[0].end) || (nowDecimal >= schedule.services[1].start && nowDecimal < schedule.services[1].end))) {
				watchOnlineStateChange('has-started');
			}
			if (isAnimating) {
				setTimeout(function() {
					document.getElementById('watch-service-online').style.transition = "transform 0.25s ease-in-out";
					document.getElementById('watch-service-online').style.transform = "translateY(0px)";
				}, 300);
			}
		}
		var timeBetween = dateTill - now;
		var days = Math.floor(timeBetween / (1000 * 60 * 60 * 24));
		var hours = Math.floor((timeBetween % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((timeBetween % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((timeBetween % (1000 * 60)) / 1000);
		document.getElementById('service-countdown-timer-days').setAttribute('data-count', days);
		document.getElementById('service-countdown-timer-days').innerHTML = ("0" + days).slice(-2);
		document.getElementById('service-countdown-timer-hours').setAttribute('data-count', hours);
		document.getElementById('service-countdown-timer-hours').innerHTML = ("0" + hours).slice(-2);
		document.getElementById('service-countdown-timer-minutes').setAttribute('data-count', minutes);
		document.getElementById('service-countdown-timer-minutes').innerHTML = ("0" + minutes).slice(-2);
		document.getElementById('service-countdown-timer-seconds').setAttribute('data-count', seconds);
		document.getElementById('service-countdown-timer-seconds').innerHTML = ("0" + seconds).slice(-2);
		if (hasParam('test') && getParam('test') == "pause") clearInterval(countdownLoop);
	}, 1000);
	function adjustMobileMenuMarginTop() {
		if (document.getElementById('mobileNavigation')) document.getElementById('mobileNavigation').style.marginTop = document.getElementById('watch-service-online') ? document.getElementById('watch-service-online').offsetHeight + "px" : 0;
	}
	adjustMobileMenuMarginTop();
	var resizing;
	document.addEventListener('click', function(e) {
		if (e.target.matches('.mobile-nav-toggle')) adjustMobileMenuMarginTop();
	});
	window.addEventListener('resize', function() {
		clearTimeout(resizing);
		resizing = setTimeout(adjustMobileMenuMarginTop, 100);
	});
// });




// eric's implementation
function TimeCounter() {
	this.schedule = services[services.length - 1]; //default
	this.days = 0;
	this.hours = 0;
	this.minutes = 0;
	this.seconds = 0;
	this.intervalId = null;
}
TimeCounter.prototype.selectSchedule = function() {
	// find the right schedule
	var now = new Date();
	for (var i = 0; i <	services.length; i++) {
		var schedule = services[i];
		if (now < schedule.start) {
			this.schedule = schedule;
		}
	}
	if (this.schedule.countTo) {
		var timeBetween = this.schedule.countTo - now;
		this.days = Math.floor(timeBetween / (1000 * 60 * 60 * 24));
		this.hours = Math.floor((timeBetween % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		this.minutes = Math.floor((timeBetween % (1000 * 60 * 60)) / (1000 * 60));
		this.seconds = Math.floor((timeBetween % (1000 * 60)) / 1000);
	} else {
		this.days = 0;
		this.hours = 0;
		this.minutes = 0;
		this.seconds = 0;
	}
}
TimeCounter.prototype.startCounter = function() {
	this.intervalId = setInterval(()=>{
		this.countDown();
		this.draw();
	}, 1000)
};
TimeCounter.prototype.stopCounter = function () {
	clearInterval(this.intervalId);
	this.intervalId = null;
};
TimeCounter.prototype.countDown = function() {
	this.seconds -= 1;
	if (this.seconds < 0) {
		this.seconds = 59;
		this.minutes -= 1;
		if (this.minutes < 0) {
			this.minutes = 59;
			this.hours -= 1;
			if (this.hours < 0) {
				this.hours = 23;
				this.days -= 1;
				if (this.days < 0) {
					timeCounter.selectSchedule();
				}
			}
		}
	}
}
TimeCounter.prototype.draw = function() {
	// check state and animate

	var state = this.schedule.name || 'watch-online';
	if (state === 'watch-online' || state === 'starting-soon' || state === 'between-services') {
		document.querySelector('.eric-clock .days').textContent = this.days;
		document.querySelector('.eric-clock .hours').textContent = this.hours;
		document.querySelector('.eric-clock .minutes').textContent = this.minutes;
		document.querySelector('.eric-clock .seconds').textContent = this.seconds;
	} else {
		// do something else
		document.querySelector('.eric-clock .days').textContent = state;
		document.querySelector('.eric-clock .hours').textContent = '';
		document.querySelector('.eric-clock .minutes').textContent = '';
		document.querySelector('.eric-clock .seconds').textContent = '';
	}

}

function ServiceSchedule(name, start, countTo = null) {
	this.name = name;
	// set this to a UTC time, on Sunday (today if it is sunday, or the most upcoming sunday)
	var sunday = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
	sunday = new Date(sunday);
	sunday.setDate(sunday.getDate() + (14 - sunday.getDay()) % 7);
	// NOTE: if today is Sunday and it is after 12:20:00, i need to use NEXT sunday
	this.start = new Date(new Date(sunday.toDateString()+ " "+start).toLocaleString("en-US", {timeZone: "America/New_York"}));
	if (countTo) {
		var todayIsSunday = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getDay() === 0;
		if (start > countTo && todayIsSunday) {
			// oh but only if today is sunday
			sunday.setDate(sunday.getDate() + 7);
		}
		this.countTo = new Date(new Date(sunday.toDateString()+ " "+countTo).toLocaleString("en-US", {timeZone: "America/New_York"}));
	} else {
		this.countTo = null;
	}
}

const services = [
	new ServiceSchedule('starting-soon','00:00:00', '09:30:00'),
	new ServiceSchedule('is-starting','09:20:00'),
	new ServiceSchedule('has-started','09:30:00'),
	new ServiceSchedule('between-services','10:20:00', '11:30:00'),
	new ServiceSchedule('is-starting','11:20:00'),
	new ServiceSchedule('has-started','11:30:00'),
	new ServiceSchedule('watch-online','12:20:00', '09:30:00'),
];
var timeCounter = new TimeCounter();
timeCounter.selectSchedule();
timeCounter.draw();
timeCounter.startCounter();

