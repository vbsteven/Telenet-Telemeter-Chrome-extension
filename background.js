window.addEventListener("load", init);

function init() {
	console.log("init called");
 timeouthandle = setInterval(function() {
     fetchdata();
   }, 60*60*1000); // update every hour
   fetchdata();
}

function fetchdata() {
  console.log('fetching data');

  var url = "https://t4t.services.telenet.be/TelemeterService";
  var username = localStorage['username'];
  var password = localStorage['password'];

  if (!username || !password) {
    // no account details yet
    console.log('called fetchdata without credentials');
    return;
  }

  var data = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:tel=\"http://www.telenet.be/TelemeterService/\"><soapenv:Header/><soapenv:Body><tel:RetrieveUsageRequest><UserId>" + username + "</UserId><Password>" + password + "</Password></tel:RetrieveUsageRequest></soapenv:Body></soapenv:Envelope>";

  // create the request
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, false);
  // mandatory header for the server to accept the request
  xhr.setRequestHeader('Content-Type','text/xml');
  try {
    xhr.send(data);
  } catch (e) {
    console.log('error occurred while fetching data from service');
    return;
  }
  if (xhr.status != 200) {
    // no 200 OK response
    console.log('telemeter service returned status ' + xhr.status);
    return;
  }
  // parse the response
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
  
  var FUP = xmlDoc.getElementsByTagName("FUP");
  if(FUP.length == 0) {
	hasDataLimit();
  } else if(FUP.length == 1) {
	hasFUP();
  }
}
function hasDataLimit() {
// get general values from the response
  var arr = xmlDoc.getElementsByTagName("TotalUsage");
  var totalusage = arr[0].childNodes[0].data;
  console.log("totalusage: " + totalusage);
  
  arr = xmlDoc.getElementsByTagName("Limit");
  var limit = arr[0].childNodes[0].data;
  console.log("limit: " + limit);

  arr = xmlDoc.getElementsByTagName("Unit");
  var unit = arr[0].childNodes[0].data;
  console.log("unit: " + unit);

  arr = xmlDoc.getElementsByTagName("Timestamp");
  var timestamp = arr[0].childNodes[0].data;
  console.log("timestamp: " + timestamp);
  
  var dailyusage = new Array();

  // get usage per day from the response
  arr = xmlDoc.getElementsByTagName("DailyUsage");
  for (i = 0; i < arr.length; i++) {
    var obj  = new Object();
    obj.day = formatdate(arr[i].childNodes[0].childNodes[0].data.substring(0, 10));
    obj.usage = arr[i].childNodes[1].childNodes[0].data;
    dailyusage.push(obj);
  }


  // get first and last day of this dataset
  var lastday = "unknown";
  var firstday = "unknown";
  if (dailyusage.length > 0) {
    lastday = dailyusage.slice(-1)[0].day;
    firstday = dailyusage.slice(0,1)[0].day;
  }
  // save values to localstorage
  localStorage['totalusage'] = totalusage;
  localStorage['limit'] = limit;
  localStorage['unit'] = unit;
  localStorage['timestamp'] = timestamp;
  localStorage['firstday'] = firstday;
  localStorage['lastday'] = lastday;

  // convert dailyusage array to JSON before storing in localstorage
  str = JSON.stringify(dailyusage);
  localStorage['dailyusage'] = str
  
  localStorage['type'] = 0;
}
function hasFUP() {
  //Get the ticket values
  var arr = xmlDoc.getElementsByTagName("Timestamp");
  var timestamp = arr[0].childNodes[0].data;
  console.log("timestamp: " + timestamp);
  
  // get the period values
  arr = xmlDoc.getElementsByTagName("From");
  var from = arr[0].childNodes[0].data;
  from = from.split("+")[0];
  from = formatdate(from);
  console.log("from: " + from);
  
  arr = xmlDoc.getElementsByTagName("Till");
  var till = arr[0].childNodes[0].data;
  till = till.split("+")[0];
  till = formatdate(till);
  console.log("till: " + till);
  
  arr = xmlDoc.getElementsByTagName("CurrentDay");
  var currentDay = arr[0].childNodes[0].data;
  console.log("currentDay: " + currentDay);
  
  // get the usage values
  arr = xmlDoc.getElementsByTagName("TotalUsage");
  var totalusage = arr[0].childNodes[0].data;
  console.log("totalusage: " + totalusage);
  
  arr = xmlDoc.getElementsByTagName("MinUsageRemaining");
  var minUsageRemaining = arr[0].childNodes[0].data;
  console.log("MinUsageRemaining: " + minUsageRemaining);
  
  arr = xmlDoc.getElementsByTagName("MaxUsageRemaining");
  var maxUsageRemaining = arr[0].childNodes[0].data;
  console.log("MaxUsageRemaining: " + maxUsageRemaining);

  arr = xmlDoc.getElementsByTagName("Unit");
  var unit = arr[0].childNodes[0].data;
  console.log("unit: " + unit);
  
  arr = xmlDoc.getElementsByTagName("LastUpdate");
  var lastUpdate = arr[0].childNodes[0].data;
  var tmpLastUpdate = lastUpdate.split('T');
  var time = tmpLastUpdate[1].split('.');
  lastUpdate = tmpLastUpdate[0] + ' ' + time[0];
  console.log("lastUpdate: " + lastUpdate);

  //get the status values
  arr = xmlDoc.getElementsByTagName("Status");
  var status = arr[0].childNodes[0].data;
  console.log("status: " + status);
  
  arr = xmlDoc.getElementsByTagName("NL");
  var statusDescription = arr[0].childNodes[0].data;
  console.log("statusDescription: " + statusDescription);
  
 
  // save values to localstorage
  localStorage['timestamp'] = timestamp;
  localStorage['from'] = from;
  localStorage['till'] = till;
  localStorage['currentday'] = currentDay;
  localStorage['totalusage'] = totalusage;
  localStorage['minusageremaining'] = minUsageRemaining;
  localStorage['maxusageremaining'] = maxUsageRemaining;
  localStorage['unit'] = unit;
  localStorage['lastupdate'] = lastUpdate;
  localStorage['status'] = status;
  localStorage['statusdescription'] = statusDescription;
  
  localStorage['type'] = 1;
}
function formatdate(input) {
  arr = input.split('-');
  if (arr.length != 3) {
    return input;
  }

  return arr[2] + '/' + arr[1] + '/' + arr[0];
}