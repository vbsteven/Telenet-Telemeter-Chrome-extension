window.addEventListener("load", init);
document.getElementById("showmorelink").addEventListener("click", showmore);
document.getElementById("report").addEventListener("click", report);

var showdetails = false;

function configure() {
  properties = new Object();
  properties.url = "options.html"
  chrome.tabs.create(properties, null);
}

function init() {
	var type = localStorage['type'];
	if(type == 0) {
		hasDataLimit();
	} else if (type == 1) {
		hasFUP();
	}
}

function hasDataLimit() {
  var limit = localStorage['limit'];
  var totalusage = localStorage['totalusage'];
  var unit = localStorage['unit'];
  var dailyusage = eval(localStorage['dailyusage']);
  var firstday = localStorage['firstday'];
  var lastday = localStorage['lastday'];
  var username = localStorage['username'];
  var password = localStorage['password'];
  
  if (!username || !password) {
    document.getElementById("h_title").innerHTML = 'No credentials found<br/><button id="configure">Configure</button>';
	document.getElementById("configure").addEventListener("click", configure);
    document.getElementById("alldata").setAttribute("class", "hidden");
    return;
  }

  if (!totalusage) {
    document.getElementById("h_title").innerHTML = 'Invalid data<br/>Are your credentials correct?<br/><button id="configure1">Configure</button>';
	document.getElementById("configure1").addEventListener("click", configure);
    document.getElementById("alldata").setAttribute("class", "hidden");
    return;
  }

  document.getElementById("h_title").innerHTML = 'Telemeter status for ' + username;
  document.getElementById("period").innerHTML = 'period: ' + firstday.substr(0,5) + ' to ' + lastday.substr(0,5);
  document.getElementById("quota").innerHTML = 'free: ' + formatQuota(limit-totalusage) + ' - used: ' + formatQuota(totalusage) + ' - limit: ' + formatQuota(limit);

  var percentage = (totalusage/limit)*100; 
  drawGeneralProgress(percentage);

  drawDetail(dailyusage, unit);
}

function hasFUP() {
  var from = localStorage['from'];
  var till = localStorage['till'];
  var currentday = localStorage['currentday'];
  var totalusage = localStorage['totalusage'];
  var minusageremaining = localStorage['minusageremaining'];
  var maxusageremaining = localStorage['maxusageremaining'];
  var unit = localStorage['unit'];
  var lastupdate = localStorage['lastupdate'];
  var status = localStorage['status'];
  var statusdescription = localStorage['statusdescription'];
  
  var username = localStorage['username'];
  var password = localStorage['password'];
  
  if (!username || !password) {
    document.getElementById("h_title").innerHTML = 'No credentials found<br/><button id="configure">Configure</button>';
	document.getElementById("configure").addEventListener("click", configure);
    document.getElementById("alldata").setAttribute("class", "hidden");
    return;
  }

  if (!totalusage) {
    document.getElementById("h_title").innerHTML = 'Invalid data<br/>Are your credentials correct?<br/><button id="configure1">Configure</button>';
	document.getElementById("configure1").addEventListener("click", configure);
    document.getElementById("alldata").setAttribute("class", "hidden");
    return;
  }

  document.getElementById("h_title").innerHTML = 'Telemeter status for ' + username;
  document.getElementById("period").innerHTML = 'period: ' + from + ' to ' + till + '<br />currentday: ' + currentday;
  document.getElementById("quota").innerHTML = 'used: ' + totalusage + ' ' + unit + ' - usage between: ' + minusageremaining + ' and ' + maxusageremaining + '<br/> last updated: ' + lastupdate;
  document.getElementById("quota").innerHTML += '<br />status: ' + status + '<br />description: ' + statusdescription;
}

function drawGeneralProgress(percentage) {
  document.getElementById('canvas_progress').setAttribute("class", "shown");
  document.getElementById('showmoreP').setAttribute("class", "shown");
  var progress = new RGraph.HProgress('canvas_progress', percentage, 100);
  progress.Set('chart.tickmarks', true);
  progress.Set('chart.margin', 3);
  progress.Set('chart.tickmarks.inner', true);
  progress.Set('chart.label.inner', true);
  progress.Set('chart.min', 0);
  progress.Set('chart.units.post', '%');
  progress.Draw();
}

function drawDetail(dailyusage, unit) {
  var values = new Array();
  var dates = new Array();

  for (i = 0; i < dailyusage.length; i++) {
    var d = dailyusage[i];
    values[i] = parseInt(dailyusage[i].usage);
    dates[i] = dailyusage[i].day.substr(0, 5);
    console.log(values[i] + ' / ' + dates[i]);
  }

  var hbar = new RGraph.HBar('canvas_detail', values); 
  hbar.Set('chart.title.xaxis', 'Usage in ' + unit);
  hbar.Set('chart.title.yaxis', 'Date');
  hbar.Set('chart.background.barcolor1', '#ccc');
  hbar.Set('chart.background.barcolor2', '#ccc');
  hbar.Set('chart.background.grid.autofit', true);
  hbar.Set('chart.units.post', ' ' + unit);
  hbar.Set('chart.text.style', '#333');
  hbar.Set('chart.colors', ['red']);
  hbar.Set('chart.labels', dates);
  hbar.Set('chart.vmargin', 2);
  hbar.Set('chart.gutter', 25);
  hbar.Set('chart.labels.above', true);
  hbar.Draw();
}

function showmore() {
  showdetails = !showdetails; 
  var span = document.getElementById("seemore");
  var link = document.getElementById("showmorelink");
  
  if (showdetails) {
    span.setAttribute("class", "shown");
    link.innerHTML = "hide daily usage";
  } else {
    span.setAttribute("class", "hidden");
    link.innerHTML = "show  daily usage";
  }
}

function report() {
  obj = new Object();
  obj.url = "https://github.com/vbsteven/Telenet-Telemeter-Chrome-extension/issues";
  chrome.tabs.create(obj);
}

function formatQuota(quota) {
  if (true) {
    temp = quota/1024;
    return temp.toFixed(2) + " GB";
  }

  // no change needed, return
  return quota + " MB";
}