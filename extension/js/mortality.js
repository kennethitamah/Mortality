Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = (this.getDate()+1).toString();
   return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};

(function(){

  var $  = document.getElementById.bind(document);

  var yearMS = 31556952000;
  var monthMS = 2628000000;
  var dayMS = 86400000;
  var hourMS = 3600000;
  var minuteMS = 60000;
  var secondMS = 1000;

  var App = function(appElement)
  {
    this.appElement = appElement;
    this.load();

    // CHANGE Previous Version /////////
    localStorage.removeItem("infoSeen");
    localStorage.removeItem("update-3.1.1");
    ////////////////////////////////////

    this.updateInterval();
    loadDarkOrLightTheme();
  };


  App.fn = App.prototype;

  App.fn.updateInterval = function()
  {
    if( localStorage.getItem("hideAge") === null ) {
      if( localStorage.getItem("swap") === null ) {
        var interval = 60000;
        var savedPrecision = localStorage.getItem("precision");
        if(savedPrecision == "sec")
        {
          interval = 1000
        }
        else if(savedPrecision == "ms" || savedPrecision === null)
        {
          interval = 115;
        }
        this.renderAge();
        setInterval(this.renderAge.bind(this),interval);
      }
      else {
        this.renderTime();
        setInterval(this.renderTime.bind(this),1000);
      }
    }
  };

  App.fn.load = function() {
	  this.dob = getDOB();
	  this.dobMinutes = localStorage.dobMinutes || 0;

	  if (localStorage.getItem("hideCircles") === null)
	  {
		  var monthBorn = this.dob.getMonth();
		  var chaptersArray = getChapters(monthBorn);

		  this.documentCircle = document.querySelector('#circles');

		  var currentDate = new Date;
		  var oneDay = 24 * 60 * 60 * 1000;

		  var diffDays = Math.round(Math.abs((this.dob.getTime() - currentDate.getTime()) / (oneDay)));
		  var numberMonths = Math.floor(diffDays / 30);

		  this.generateCircleLoops(numberMonths, chaptersArray);
    }
  };

  App.fn.generateCircleLoops = function(numberMonths, chaptersArray)
  {
    for (var chapter = 0; chapter < chaptersArray.length; chapter++) {
      var startMonth = chaptersArray[chapter][0] + 1;
      var endMonth = chaptersArray[chapter][1];
      var bkgdColor = getColorTheme()[chapter];

      var x;
      if( numberMonths > endMonth ) {
        for(x = startMonth ; x <= endMonth ; x++) {
          this.createCircle(bkgdColor, '1.00');
        }
      }
      else if( numberMonths > (startMonth-1) && numberMonths <= endMonth ){
        for(x = startMonth ; x < numberMonths ; x++) {
          this.createCircle(bkgdColor, '1.00');
        }

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute("fill",bkgdColor);
        path.id = 'path';

        var pie = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        pie.setAttribute("class","pie");
        pie.setAttribute("opacity","1.0");



        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.id = 'piecircle';
        circle.setAttribute("cx","10");
        circle.setAttribute("cy","10");
        circle.setAttribute("r","10");
        circle.setAttribute("fill", bkgdColor);
        circle.setAttribute("fill-opacity","0.25");
        pie.appendChild(circle);
        pie.appendChild(path);
        this.documentCircle.appendChild(pie);

        for(x = (numberMonths+1) ; x <= endMonth ; x++) {
          this.createCircle(bkgdColor, '0.25');
        }
      }
      else
      {
        for(x = startMonth ; x <= endMonth ; x++) {
          this.createCircle(bkgdColor, '0.25');
        }
      }
    }
  };

  App.fn.createCircle = function(bkgdColor, opacity) {
    var circle = document.createElement('div');
    circle.className = 'circle';
    circle.style.backgroundColor = bkgdColor;
    circle.style.opacity = opacity;
    this.documentCircle.appendChild(circle);
  };

  App.fn.saveDob = function()
  {
    var dateInput = $('dob-input');
    //TODO: Show ERROR
    if( !dateInput.valueAsDate ) return;

    this.dob = dateInput.valueAsDate;
    localStorage.setItem("dob", this.dob.getTime());

    var timeChecked = document.querySelector('input[id=time-checkbox]').checked;
    if( timeChecked )
    {
      var timeInput = $('time-input');
      //TODO: Show ERROR
      if( !timeInput.valueAsDate ) return;
      var timeArray = timeInput.value.split(":");
      this.dobMinutes = timeArray[0]*60 + timeArray[1]*1;
      localStorage.dobTimeSet = "YES";
      localStorage.dobMinutes = this.dobMinutes;
    }
    else
    {
      this.dobMinutes = 0;
      localStorage.removeItem("dobTimeSet");
      localStorage.removeItem("dobMinutes")
    }
    var hideAgeChecked = document.querySelector('input[id=hideAge-checkbox').checked;
    hideAgeChecked ? localStorage.setItem("hideAge", "YES") : localStorage.removeItem("hideAge");

	  var hideCirclesChecked = document.querySelector('input[id=hideCircles-checkbox').checked;
	  hideCirclesChecked ? localStorage.setItem("hideCircles", "YES") : localStorage.removeItem("hideCircles");

    var swapTimerChecked = document.querySelector('input[id=swapTimer-checkbox').checked;
    swapTimerChecked ? localStorage.setItem("swap", "YES") : localStorage.removeItem("swap");
  };

  App.fn.renderAge = function()
  {
    var now = new Date();
    var timezoneOffset = now.getTimezoneOffset() * minuteMS;
    var duration  = now - this.dob + timezoneOffset - (parseInt(this.dobMinutes)*minuteMS);

    var savedPrecision = localStorage.getItem("precision");
    while(true) {
	    var years = Math.floor(duration / yearMS);
	    var yearString = zeroFill(years.toString(), 2);
	    if (savedPrecision == "year") {
		    break;
	    }
	    duration -= (years * yearMS);
	    var months = Math.floor(duration / monthMS);
	    var monthString = zeroFill(months.toString(), 2);
	    if (savedPrecision == "month") {
		    break;
	    }
	    duration -= (months * monthMS);
	    var days = Math.floor(duration / dayMS);
	    var dayString = zeroFill(days.toString(), 2);
	    if (savedPrecision == "day") {
		    break;
	    }
	    duration -= (days * dayMS);
	    var hours = Math.floor(duration / hourMS);
	    var hourString = zeroFill(hours.toString(), 2);
	    if (savedPrecision == "hour") {
		    break;
	    }
	    duration -= (hours * hourMS);
	    var minutes = Math.floor(duration / minuteMS);
	    var minuteString = zeroFill(minutes.toString(), 2);
	    if (savedPrecision == "min") {
		    break;
	    }
	    duration -= (minutes * minuteMS);
	    var seconds = Math.floor(duration / secondMS);
	    var secondString = zeroFill(seconds.toString(), 2);
	    if (savedPrecision == "sec") {
		    break;
	    }
	    duration -= (seconds * secondMS);
	    var milliseconds = Math.floor(duration / 10);
	    var msString = zeroFill(milliseconds.toString(), 2);
	    break;
    }

    // yearString = now.getHours();
    // monthString = ":"
    // dayString = now.getMinutes();
    // hourString = ":"
    // minuteString = now.getSeconds();
    var savedTheme = localStorage.getItem("colorTheme");
    if(savedTheme == "light" || savedTheme == "rainbowl") {
      var whiteFlag = "YES";
    }
    else {
      var blackFlag = "YES";
    }

    requestAnimationFrame(function()
    {
      this.setAppElementHTML(this.getTemplateScript('age')(
      {
        white: whiteFlag,
        black: blackFlag,
        year: yearString,
        month: monthString,
        day: dayString,
        hour: hourString,
        minute: minuteString,
        second: secondString,
        ms: msString
      }));
    }.bind(this));
  };

  App.fn.renderTime = function()
  {
    var now = new Date();
    var ampmString = "AM";
    var hour = now.getHours();
    if( hour > 12 ) {
      ampmString = "PM";
      hour = hour % 12;
    }
    var hourString = zeroFill(hour.toString(), 2);
    var minuteString = zeroFill(now.getMinutes().toString(), 2);
    var secondString = zeroFill(now.getSeconds().toString(), 2);

    var savedTheme = localStorage.getItem("colorTheme");
    if(savedTheme == "light" || savedTheme == "rainbowl") {
      var whiteFlag = "YES";
    }
    else {
      var blackFlag = "YES";
    }

    requestAnimationFrame(function()
    {
      this.setAppElementHTML(this.getTemplateScript('clock')(
      {
        white: whiteFlag,
        black: blackFlag,
        hour: hourString,
        minute: minuteString,
        second: secondString,
        ampm: ampmString
      }));
    }.bind(this));
  };

  App.fn.setAppElementHTML = function(html){
    this.appElement.innerHTML = html;
  };

  App.fn.getTemplateScript = function(name){
    var templateElement = $(name + '-template');
    return Handlebars.compile(templateElement.innerHTML);
  };

  window.app = new App($('app'))

})();

function infoButtonPressed()
{
  if(localStorage.getItem("dob")===null)
  {
    setModalPopup();
    setButtonPressed(2);
  }
  //UPDATE WHEN REVVING VERSIONS
	else if(localStorage.getItem("version")=="3.2.0")
	{
		setButtonPressed(0);
	}
	else
	{
		setButtonPressed(1);
    document.getElementById("update-bubble").style.display = "none";
    localStorage.setItem("version", "3.2.0");
	}

	if(document.getElementById("info-img").src.indexOf("assets/infoWhiteAlert.png") > -1)
	{
		document.getElementById("info-img").src = "assets/infoWhite.png"
	}
	else if(document.getElementById("info-img").src.indexOf("assets/infoBlackAlert.png") > -1)
	{
		document.getElementById("info-img").src = "assets/infoBlack.png"
	}
}

function setModalPopup()
{
  $('#inline-popup').magnificPopup({
    removalDelay: 800, //delay removal by X to allow out-animation
    callbacks: {
      beforeOpen: function() {
         this.st.mainClass = this.st.el.attr('data-effect');
      }
    },
    closeBtnInside: false,
    modal: true,
    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
  });
}

$('#info-button').click(function()
{
	infoButtonPressed();
});

$("#about-button").click(function()
{
  if(localStorage.getItem("dob")===null)
  {
    setButtonPressed(2);
  }
  else
  {
    setButtonPressed(0);
  }
});

$("#updates-button").click(function()
{
  if(localStorage.getItem("dob")===null)
  {
    setButtonPressed(2);
  }
  else
  {
    setButtonPressed(1);
  }
});

$("#settings-button").click(function()
{
	setButtonPressed(2);
});

function setButtonPressed(button)
{
	var updatesButton = document.querySelector("#updates-button");
	var aboutButton = document.querySelector("#about-button");
	var settingsButton = document.querySelector("#settings-button");
  var popupBody = document.querySelector('#popup-body');
	if (button == 0)
	{
    popupBody.innerHTML = window.app.getTemplateScript('about-popup')();
		aboutButton.className = "pressed-button";
		updatesButton.className = "default-button";
		settingsButton.className = "default-button";
	}
	else if (button == 1)
	{
    popupBody.innerHTML = window.app.getTemplateScript('updates-popup')();
		aboutButton.className = "default-button";
		updatesButton.className = "pressed-button";
		settingsButton.className = "default-button";
	}
	else
	{
    popupBody.innerHTML = window.app.getTemplateScript('settings-popup')();
		aboutButton.className = "default-button";
		updatesButton.className = "default-button";
		settingsButton.className = "pressed-button";

    setupSettings(window.app.dob, window.app.dobMinutes);
	}
  if(localStorage.getItem("dob")===null)
  {
    $("#cancel-button").toggle();
  }
}

function setupSettings(dob, dobMinutes)
{
  loadCheckBoxes();

  document.getElementById('dob-input').value = dob.yyyymmdd();
  document.getElementById('time-input').value = getTimeStringFromMinutes(dobMinutes);
  setDropdownWithCurrentTheme();

  var savedPrecision = localStorage.getItem("precision");
  if (savedPrecision != null) {
    document.getElementById("precision-dropdown").value = savedPrecision;
  }

  var savedChapterLengths = JSON.parse(localStorage.getItem("chapterLengths"));
  if( savedChapterLengths === null )
  {
    savedChapterLengths = [5,7,2,4,4,43,15,0];
  }

  $("#first-chapter-input").val(savedChapterLengths[0]);
  $("#second-chapter-input").val(savedChapterLengths[1]);
  $("#third-chapter-input").val(savedChapterLengths[2]);
  $("#fourth-chapter-input").val(savedChapterLengths[3]);
  $("#fifth-chapter-input").val(savedChapterLengths[4]);
  $("#sixth-chapter-input").val(savedChapterLengths[5]);
  $("#seventh-chapter-input").val(savedChapterLengths[6]);
  $("#eighth-chapter-input").val(savedChapterLengths[7]);


  $("#submit-button").click(function(){
    window.app.saveDob();
    saveTheme();
	  savePrecision();
    saveChapterLengths();
    $("#info-popup").magnificPopup('close');
  });

  $("#cancel-button").click(function(){
    $("#info-popup").magnificPopup('close');
  });
}

function loadCheckBoxes()
{
  var timeCheckbox = document.querySelector('input[id=time-checkbox]');
  if (localStorage.getItem("dobTimeSet") == "YES")
  {
    timeCheckbox.checked = true;
  }
  showTimeSelectorIf(timeCheckbox.checked);

  timeCheckbox.addEventListener('change', function () {
    showTimeSelectorIf(timeCheckbox.checked);
  });

  var hideAgeCheckbox = document.querySelector('input[id=hideAge-checkbox]');
  if (localStorage.getItem("hideAge") == "YES")
  {
    hideAgeCheckbox.checked = true;
  }

  hideAgeCheckbox.addEventListener('change', function () {
    var hideCirclesCheckbox = document.querySelector('input[id=hideCircles-checkbox]');
    if(hideCirclesCheckbox.checked == true)
    {
      hideCirclesCheckbox.checked = false;
    }
  });

	var hideCirclesCheckbox = document.querySelector('input[id=hideCircles-checkbox]');
	if (localStorage.getItem("hideCircles") == "YES")
	{
		hideCirclesCheckbox.checked = true;
	}

  hideCirclesCheckbox.addEventListener('change', function () {
    var hideAgeCheckbox = document.querySelector('input[id=hideAge-checkbox]');
    if(hideAgeCheckbox.checked == true)
    {
      hideAgeCheckbox.checked = false;
    }
  });

  var swapTimerCheckbox = document.querySelector('input[id=swapTimer-checkbox]');
  if (localStorage.getItem("swap") == "YES")
  {
    swapTimerCheckbox.checked = true;
  }
}

function setDropdownWithCurrentTheme(){
  var theme = localStorage.getItem("colorTheme");
  if (theme != null) {
    document.getElementById("theme-dropdown").value = theme;
  }
}


function setWhiteInfoButton()
{
  if(localStorage.getItem("version") == "3.2.0") {
    document.getElementById("info-img").src = "assets/infoWhite.png";
    document.getElementById("update-bubble").style.display = "none";
  }
  else {
    document.getElementById("info-img").src = "assets/infoWhiteAlert.png";
    document.getElementById("update-bubble").style.display = "block";
  }
}

function setBlackInfoButton()
{
  if(localStorage.getItem("version") == "3.2.0") {
    document.getElementById("info-img").src = "assets/infoBlack.png";
    document.getElementById("update-bubble").style.display = "none";
  }
  else {
    document.getElementById("info-img").src = "assets/infoBlackAlert.png";
    document.getElementById("update-bubble").style.display = "block";
  }
}



function saveTheme()
{
  var savedTheme = localStorage.getItem("colorTheme");
  var selectedTheme = document.getElementById("theme-dropdown").value;

  if (savedTheme != selectedTheme) {
	  localStorage.setItem("colorTheme", selectedTheme);
  }
}

function savePrecision()
{
	var selectedPrecision = document.getElementById("precision-dropdown").value;
	localStorage.setItem("precision", selectedPrecision);
}

function saveChapterLengths()
{
  var chapterLengths = [
    $("#first-chapter-input").val(),
    $("#second-chapter-input").val(),
    $("#third-chapter-input").val(),
    $("#fourth-chapter-input").val(),
    $("#fifth-chapter-input").val(),
    $("#sixth-chapter-input").val(),
    $("#seventh-chapter-input").val(),
    $("#eighth-chapter-input").val()
  ];
  localStorage.setItem("chapterLengths", JSON.stringify(chapterLengths));
}

function loadDarkOrLightTheme()
{
    var savedTheme = localStorage.getItem("colorTheme");
    if(savedTheme == "light" || savedTheme == "rainbowl")
    {
      document.body.style.backgroundColor = "#F5F5F5";
      document.body.style.color = "#424242";
      setBlackInfoButton();
    }
    else
    {
      document.body.style.backgroundColor = "#1d1d1d";
      document.body.style.color = "#eff4ff";
      setWhiteInfoButton();
    }
}

function getColorTheme() {
  var themes = {
    "def" : ['#311B92', '#1A237E', '#0D47A1', '#006064', '#004D40', '#1B5E20', '#33691E', '#689F38'],
    "dark" : ['#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#2E2E2E'],
    "light" : ['#212121', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD', '#E0E0E0', '#ECECEC'],
    "dawn" : ['#FFEB3B', '#FBC02D', '#F9A825', '#FF9800', '#F57C00', '#E65100', '#795548', '#4E342E'],
    "dusk" : ['#391003', '#5D1A25', '#722007','#ab300a', '#bf360c', '#cb5e3c', '#C47A6F', '#df9a85'],
    "twilight" : ['#4527A0', '#283593', '#3F51B5', '#5C6BC0', '#8c97d2', '#78909C', '#B0BEC5', '#ECEFF1'],
    "retro" : ['#13a1a9', '#18CAD4', '#941036', '#D4184E', '#FFF14C', '#FF984C', '#00E8BB', '#00a282'],
    "rainbowl" : ['#B71C1C', '#E65100', '#FFD600', '#1B5E20', '#004D40', '#3378af', '#673AB7', '#482880'],
    "rainbowd" : ['#ee4035', '#f37736', '#fcec4d', '#7bc043', '#009688', '#0392cf', '#644ca2', '#482880']
  };

  var savedTheme = localStorage.getItem("colorTheme");

  if (savedTheme == null) {
    return themes.def;
  }
  else {
    switch (savedTheme) {
      case "default":
        return themes.def;
      case "dark":
        return themes.dark;
      case "light":
        return themes.light;
      case "dawn":
        return themes.dawn;
      case "dusk":
        return themes.dusk;
      case "twilight":
        return themes.twilight;
      case "retro":
        return themes.retro;
      case "rainbowd":
        return themes.rainbowd;
      case "rainbowl":
        return themes.rainbowl;
      default:
        return themes.def;
    }
  }
}

function getChapters(monthBorn) {
  var savedChapterLengths = JSON.parse(localStorage.getItem("chapterLengths"));
  if( savedChapterLengths === null )
  {
    savedChapterLengths = [5,7,2,4,4,43,15,0];
  }

  for( var i=0; i<8; i++ ) {
    savedChapterLengths[i] = savedChapterLengths[i]*12
  }

  var index = 0;
  var totalMonths = 0;
  for( index; index<8; index++ ) {
    if((totalMonths+savedChapterLengths[index]) > 945) {
      savedChapterLengths[index] = (945-totalMonths);
    }
    totalMonths += savedChapterLengths[index];
  }

  var beginningChapter = 0;
  var firstChapter = savedChapterLengths[0];
  var educationStartOffset = 0;
  if(monthBorn == 11)
  {
   educationStartOffset = 8;
  }
  else
  {
   educationStartOffset = (7-monthBorn);
  }
  firstChapter += educationStartOffset;
  var secondChapter = firstChapter + (savedChapterLengths[1]);
  var thirdChapter = secondChapter + (savedChapterLengths[2]);
  var fourthChapter = thirdChapter + (savedChapterLengths[3]);
  var fifthChapter = fourthChapter + (savedChapterLengths[4]);
  //540
  var sixthChapter = fifthChapter + (savedChapterLengths[5]);
  //141
  var seventhChapter = sixthChapter + (savedChapterLengths[6]);
  var eighthChapter = 945;



  return [[beginningChapter, firstChapter], [firstChapter, secondChapter], [secondChapter, thirdChapter]
    ,[thirdChapter, fourthChapter], [fourthChapter, fifthChapter]
    ,[fifthChapter, sixthChapter], [sixthChapter, seventhChapter]
    ,[seventhChapter, eighthChapter]];
}


function showTimeSelectorIf(isChecked) {
  if (isChecked) {
      document.getElementById("time-input").style.display = "block";
  } else {
      document.getElementById("time-input").style.display = "none";
  }
}

function getDOB() {
  var savedDoB = localStorage.getItem("dob");
  if( savedDoB === null) {
    return new Date;
  }
  else {
    return new Date(parseInt(savedDoB));
  }
}

function zeroFill(number, width)
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + "";
}

function animate(theta, radius) {
  var path = document.getElementById('path');
  var piecircle = document.getElementById('piecircle');
  if(path && piecircle) {
    piecircle.setAttribute("cx",radius);
    piecircle.setAttribute("cy",radius);
    piecircle.setAttribute("r",radius);

    theta += 0.5;
    theta %= 360;
    var x = Math.sin(theta * Math.PI / 180) * radius;
    var y = Math.cos(theta * Math.PI / 180) * -radius;
    var d = 'M0,0 v' + -radius + 'A' + radius + ',' + radius + ' 1 ' + ((theta > 180) ? 1 : 0) + ',1 ' + x + ',' + y + 'z';
    path.setAttribute('d', d);
    path.setAttribute('transform', 'translate(' + radius + ',' + radius + ')');
  }
  setTimeout(animate, 7200000); // 1/360 of a month in ms
}

function getTimeStringFromMinutes(totalMinutes) {
  var hours = Math.floor(totalMinutes/60);
  var minutes = totalMinutes%60;
  return zeroFill(hours,2)+":"+zeroFill(minutes,2)+":00";
}

(function() {
  window.onresize= function() {
    var div = document.querySelector('#circles');
    var circleWidth = div.childNodes[0].offsetWidth;
    circle.style.height= circleWidth +'px';
	  var radius = circle.style.height;
    pie.style.width = radius;
    pie.style.height = radius;

    var tempDoB = localStorage.dob;
    var tempDateDoB;
    if( tempDoB != 'null') {
      tempDateDoB = new Date(parseInt(tempDoB));
    }

    var currentDate = new Date;
    var oneDay = 24*60*60*1000;

    var diffDays = Math.round(Math.abs((currentDate.getTime() - tempDateDoB.getTime())/(oneDay)));
    var fractionOfMonth = ((diffDays%30)/30.0)*360;

    animate(fractionOfMonth, circleWidth/2);
  };

  var styleSheets = document.styleSheets,
      circle,
      pie,
      i, j, k;
  k = 0;
	var rules;
	for (i = 0; i < styleSheets.length; i++) {
		rules = styleSheets[i].rules ||
		styleSheets[i].cssRules;
		for (j = 0; j < rules.length; j++) {
			if (rules[j].selectorText === '.circle') {
				circle = rules[j];
				k++;
				if (k > 1) {
					break;
				}
			}
			else if (rules[j].selectorText === '.pie') {
				pie = rules[j];
				k++;
				if (k > 1) {
					break;
				}
			}
		}
	}
})();

(function($) {
    $(window).load(function () {
      if(localStorage.getItem("dob")===null)
      {
	      $("#cancel-button").toggle();
        $("#info-button")[0].click();
      }
    });
})();

window.onresize();

