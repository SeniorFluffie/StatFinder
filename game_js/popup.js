// for optimizations and debugging
'use strict';

const API_KEYS = [
  {game: 'fortnite', key: 'XXXXXXXXXX', url: 'https://api.fortnitetracker.com/v1/profile/<sys>/<ign>', oneSystem: false, regions: false, oneView: true},
  {game: 'league', key: 'XXXXXXXXXX', url: 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/<ign>?api_key=<key>', oneSystem: true, regions: false, oneView: true},
  {game: 'pubg', key: 'XXXXXXXXXX', url : 'https://api.playbattlegrounds.com/shards/pc-na/players?filter[playerNames]=<ign>', oneSystem: true, regions: true, oneView: true},
  {game: 'csgo', key: 'XXXXXXXXXX', url: 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=<key>&vanityurl=<ign>', oneSystem: true, regions: false, oneView: true},
  {game: 'dota', key: 'XXXXXXXXXX', url: '', oneSystem: true, regions: true, oneView: true},
  {game: 'overwatch', key: 'XXXXXXXXXX', url: 'https://ow-api.com/v1/stats/<sys>/us/<ign>/complete', oneSystem: false, regions: true, oneView: false},
  {game: 'osu', key: 'XXXXXXXXXX', url: 'https://osu.ppy.sh/api/get_user?k=<key>&u=<ign>', oneSystem: true, regions: false, oneView: true},
  {game: 'halo', key: 'XXXXXXXXXX', url: 'https://www.haloapi.com/profile/h5/profiles/<ign>/appearance', oneSystem: true, regions: false, oneView: false}
];

const SYSTEM_TAGS = ['pc', 'psn', 'xb1'];

const timeout = {short: 500, medium: 750, long: 1250};

var canSearch = true;

window.onload = function() {
  // player search
  let searchButton = $('#searchButton')[0];
  // when the search button is pressed
  searchButton.onclick = function(element) {
    // stop default post req
    element.preventDefault();
    // localize lookup data
    let searchBar = $('#searchBar')[0];
    // save player name
    let IGN = searchBar.value;
    // if no name in field
    IGN === '' ? alert('Please enter a valid username!') : search(IGN);
  };
}

// initial game lookup function
function search(IGN) {
  // play sound (and forward start time)
  let buttonPress = $('#searchSound')[0];
  buttonPress.currentTime = 0.1;
  buttonPress.play();
  // create index flag
  let gameIndex = 0;
  // localize game buttons
  let gameButtons = $('.gameButton').not('.systemButton');
  // iterate through only game buttons
  gameButtons.each(function() {
    // if active, break loop
    if($(this).hasClass('active'))
      return false;
    // increment index
    gameIndex++;
  });
  // if a game is selected
  if(gameIndex < gameButtons.length && canSearch) {
    // add index property
    API_KEYS[gameIndex].gameID = gameIndex;
    // request data from the specific game
    requestData(API_KEYS[gameIndex], IGN);
  }
  // else display alert
  else if(gameIndex >= gameButtons.length && canSearch)
    alert('Please select a game to search stats for!');
}

function requestData(data, IGN) {
  // enable timer
  incrementTimer(refreshTimer);
  // store copy of search (for refresh button)
  recentSearch === undefined ? recentSearch = {options: Object.assign({IGN: IGN}, data)} : recentSearch = Object.assign(recentSearch, {options: {IGN: IGN}, data: data});
  // localize the url
  let url;
  // set url for single-platform
  if(data.oneSystem) {
    // skip request, if using steam id
    if((data.game === 'csgo' || data.game === 'dota') && numberCheck(IGN) && IGN.length === 17) {
      updatePopup({options: Object.assign(data, {hasLoaded: false, steamid: IGN})}, data.gameID)
      return;
    }
    // update url
    url = data.url.replace('<ign>', IGN).replace('<key>', data.key);
  }
  // else specify platform
  else {
    // get system select buttons
    let systemButtons = $('.systemButton');
    // iterate through all button elements
    for(var j = 0; j < systemButtons.length; j++) {
      // if there is no system selected
      if(!$(systemButtons[j]).hasClass('active') && j === systemButtons.length - 1) {
        alert('Please select a system you would like to search the stats for!');
        canSearch = true;
      }
      // else stop on the active button
      else if($(systemButtons[j]).hasClass('active')) {
        // convert to readable url
        if(data.game === 'overwatch')
          IGN = IGN.replace('#', '-');
        // set url
        url = data.url.replace('<sys>', SYSTEM_TAGS[j]).replace('<ign>', IGN).replace('<key>', data.key);
        // update flag (stops spamming)
        canSearch = false;
        break;
      }
    }
  }
  // create XML request
  let request = new XMLHttpRequest();
  // open asynchronous get request
  request.open('GET', url, true);
  setHeader(data, request);
  // instructions for when the message is recieved
  request.onreadystatechange = function() {
    // handle status codes
    requestHandler(this, function () {
      // parse the data
      let gameData = JSON.parse(request.responseText);
      // general error check
      if(gameData.error !== undefined || gameData === undefined || gameData.length === 0) {
        canSearch = true;
        alert('Error 404! User Not Found!');
      }
      else {
        // add response (for sending headers)
        gameData = {data: gameData, options: Object.assign(data, {hasLoaded: false})};
        // update window
        updatePopup(gameData, data.gameID);
      }
    });
  }
  // send get request
  request.send();
}

function setHeader(data, request) {
  // specific options (for each game)
  if(data.game === 'fortnite')
    request.setRequestHeader('TRN-Api-Key', data.key);
  else if(data.game === 'pubg') {
    request.setRequestHeader("Accept", "application/vnd.api+json");
    request.setRequestHeader("Authorization", "Bearer <key>".replace("<key>", data.key));
  }
  else if(data.game === 'osu')
    request.setRequestHeader('Access-Control-Allow-Origin', '*');
  else if(data.game === 'halo') {
    request.setRequestHeader('Ocp-Apim-Subscription-Key', data.key);
    request.setRequestHeader('Access-Control-Allow-Origin', '*');
  }
}

function requestHandler(request, success) {
  if(request.readyState === 4) {
    // if success
    if(request.status === 200)
      // run function
      success();
    // else display the error code
    else if(request.status === 400)
    alert('Error 400! Bad Search Request!');
    else if(request.status === 401)
    alert('Error 401! Unauthorized Request!');
    else if(request.status === 403)
    alert('Error 403! Forbidden Request!');
    else if(request.status === 404)
    alert('Error 404! User Not Found!');
    else if(request.status === 429)
    alert('Error 429! Too Many Requests!');
    else if(request.status === 500)
    alert('Error 500! Internal Server Error!');
    else if(request.status === 503)
    alert('Error 503! Service Unavailable!');
  }
}

function updatePopup(data, gameID) {
  // switch case to determine search
  switch(gameID) {
    case 0:
    fortniteSearch(data);
    break;
    case 1:
    leagueSearch(data);
    break;
    case 2:
    pubgSearch(data);
    break;
    case 3:
    csgoSearch(data);
    break;
    case 4:
    console.log('Begin Dota 2 Search');
    break;
    case 5:
    overwatchSearch(data);
    break;
    case 6:
    osuSearch(data);
    break;
    case 7:
    haloSearch(data);
    break;
  }
}

function getMetaData(data, url, property) {
  // only occur once
  if(!data.options.hasLoaded) {
    // iterate all meta urls
    for(let address of url) {
      // create req and url
      let request = new XMLHttpRequest();
      let url = address.url;
      request.open('GET', url, true);
      // set header
      setHeader(data.options, request);
      // upon success
      request.onreadystatechange = function() {
        requestHandler(this, function() {
          // save request to data
          let parse = JSON.parse(request.responseText);
          // either whole object or property
          property ? data['data'][address.key] = parse[property] : data['data'][address.key] = parse;
        });
      }
    // send header
    request.send();
    }
  // update flag
  data.options.hasLoaded = true;
  }
}

function objectSearch(key, value, array) {
  // search for a specific object
  return Object.values(array).find(function (obj) {
    return obj[key] == value;
  });
}

function initializeWindow() {
  console.log(recentSearch);
  // set player name and image
  $('#playerName').val(recentSearch.options.IGN);
  // clear name field
  $('#searchBar')[0].value = '';
  // add view switch (if game has it)
  recentSearch.options.oneView || recentSearch.options.oneView === undefined ? $('#viewSwitch').css('display', 'none') : $('#viewSwitch').css('display', 'inline');
  // show stats
  $('#statDisplay').fadeIn(500);
  // clear table
  $('#tableDiv').empty();
  // hide game window
  $('#gameSelect').css('display', 'none');
  // set boolean
  gameMenu = false;
  // enable timer
  incrementTimer(refreshTimer);
}

function propertySearch(object, prop) {
  // base case 1
  if(object === null)
    return undefined;
  // base case 2
  if(object.hasOwnProperty(prop) || object[prop] !== undefined)
  	return object[prop];
  // else iterate through all properties
  for(let subKey in object) {
    // skip iteration if wrong conditions
    if(typeof object[subKey] !== 'object' || !object.hasOwnProperty(subKey))
    	continue;
    // recursively call search
    let match = propertySearch(object[subKey], prop);
    // return result (if valid)
    if(match != undefined && !(match instanceof Object))
      return match;
  }
  return undefined;
}

function updateView(data, func, counter, urlData) {
  // re-use data if error occurs
  if(urlData === undefined || urlData.counter === urlData.url.length) {
    recentSearch.stats = undefined;
    recentSearch.data = data;
  } else
    recentSearch.stats = $('#tableDiv')[0].innerHTML;
  // reset counters
  if(urlData) urlData.counter = 0;
  // store data
  recentSearch.func = func;
  recentSearch.counter = counter;
}

function loadView(switchView) {
  // normal view
  if(recentSearch.counter === undefined)
    recentSearch.stats ? $('#tableDiv').html(recentSearch.stats) : recentSearch.func(recentSearch.data, 0);
  else
    // either increment or normal --> either saved display or create new one
    switchView ? recentSearch.func(recentSearch.data, recentSearch.counter.value = ++recentSearch.counter.value % recentSearch.counter.mod)
    : (recentSearch.stats ? $('#tableDiv').html(recentSearch.stats) : recentSearch.func(recentSearch.data, recentSearch.counter.value % recentSearch.counter.mod));
}

function createTable(data, tableData, style) {
  // localize elements
  let headerData = tableData[0];
  let cellData = tableData[1];
  let headerStyle = style[0];
  let cellStyle = style[1];
  // get table widths
  let tableWidth = [];
  for(let rows = 0; rows < headerData.length; rows++)
    tableWidth[rows] = cellData[headerData[rows].index[0]].length;
  // retrieve table
  var statTable = $('<table>', {'id': 'statTable', 'class': 'statTable', 'rules': 'all'});
  // add table to div then to window
  $('#statDisplay').append($('#tableDiv').append(statTable));
  // iterate through headers
  for(let i = 0; i < headerData.length; i++) {
    // create header
    createHeaderRow(statTable, headerData[i].header, tableWidth[i], headerStyle);
    // further the data path
    let property = data;
    if(headerData[i].property && headerData[i].counter === undefined)
      for(let path of headerData[i].property)
        property = property[path];
    // iterate through indices (rows)
    for(let j = 0; j < headerData[i].index.length; j++) {
      let header = headerData[i];
      // increment each row for its own data
      if(header.counter !== undefined)
        property = data[header.property[header.counter++]];
      // create table row (dependant on path)
      let row = cellData[header.index[j]];
      // to switch data mid row
      if(header.increment !== undefined)
        row.increment = header.increment;
      // use specific path or whole object
      property ? createTableRow(statTable, row, property, cellStyle)
      : createTableRow(statTable, row, data, cellStyle);
      // update increment value
      header.increment = row.increment;
    }
  }
}

function createHeaderRow(table, header, span, css) {
  // create header text
  let headerText = $('<th>', {align: 'center', colspan: span}).text(header);
  let headerRow = $('<tr>', {class: 'tableHeader'}).css(css);
  // append header to table
  table.append((headerRow.append(headerText)));
}

function createTableRow(table, data, property, css) {
  // row to be added
  let tableRow = $('<tr>');
  // iterate through each cell
  for(let i = 0; i < data.length; i++) {
    let cellTitle, cellValue, text;
    // increment data
    if(data[i].increment)
      ++data.increment;
    // switch data mid row or regular text
    data.increment != undefined ? text = propertySearch(property[data.increment], data[i].key)
    : text = propertySearch(property, data[i].key);
    if(text === undefined)
      recentSearch['options']['game'] === 'csgo' || recentSearch['options']['game'] === 'fortnite' ? text = '0' : text = 'N/A';
    // cell to be added
    if(data[i].img === undefined) {
      // regular cell
      cellTitle = $('<span>').css(css[0]).text(data[i].title);
      // round number
      if(numberCheck(text)) {
        text = Math.round(text * 100) / 100;
        text = addCommas(text)
      }
      // capitalize first letter of word
      else if(lowerCheck(text))
        text = capitalizeFirst(text);
      // otherwise use preset display values
      else if(text.displayValue !== undefined || text.value !== undefined)
        text.displayValue ? (!text.displayValue.includes('%') ? text = text.value : text = text.displayValue) : text = text.value;
      // remove exclusion character
      if(typeof text === 'string' && text.includes('&'))
        text = text.toString().replace('&', '');
      // else add commas
      else
        text = addCommas(text);
      // add % sign
      if(data[i].title.includes('%') && !text.includes('%'))
        text += '%';
      // set value
      cellValue = $('<span>').css(css[1]).text(text);
    } else {
      // set title of image
      let title = data[i].imgTitle ? propertySearch(property[data.increment], data[i].imgTitle) : '';
      // image table cell
      cellTitle = $('<span>').text(data[i].title).css(css[0]);
      cellValue = $('<img>', {src: text, class: 'cellIcon', title: title});
    }
    // combine elements to cell
    let tableCell = $('<td>').css(css[2]).append(cellTitle).append(cellValue);
    // add cell to row to table
    tableRow.append(tableCell);
  }
  // add table row to table
  table.append(tableRow);
}

function numberCheck(number) {
  // either a number thats not null or string containing only numbers
  return (typeof number === 'number' && number !== 0)
  || (typeof number === 'string' && !number.search(/^\d*\.?\d+$/))
}

function addCommas (number) {
  // seperate integer and decimal
  let text = number.toString().split('.');
  // add in commas to integer then splice back
  text[0] = text[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return text.join('.');
}

function lowerCheck(string) {
  return typeof string === 'string' && !string.search(/^[a-z]/);
}

function capitalizeFirst(string) {
  return string = string.charAt(0).toUpperCase() + string.slice(1);
}
