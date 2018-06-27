// for optimizations and debugging
'use strict';

const pubg_URLS = {base: 'https://api.playbattlegrounds.com/shards/pc-na',
url: ['/seasons', '/players/<id>/seasons/<season>'], counter: 0};

let pubgCounter = {value: 0, mod: 2};

function pubgSearch(data) {
  // save player data
  let player = {id: data.data[0].id, key: data.key};
  // retrieve current season
  retrieveStats(pubg_URLS.url[0], player, 'season');
  // retrieve seasonal data (using the retrieved data)
  setTimeout(function() {
    retrieveStats(pubg_URLS.url[1], player, 'stats');
  }, timeout.short);
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    updateView(player, pubgTable, pubgCounter, pubg_URLS);
    initializeWindow();
    // set icon
    $('#playerIcon').prop('src', '/images/icon_pubg.png');
    // create tables
    loadView();
  }, timeout.long);
}

function retrieveStats(url, data, prop) {
  // set url
  url = pubg_URLS.base + url;
  // if player stats override
  if(url.includes('<id>') || url.includes('<season>'))
    url = url.replace('<id>', data.id).replace('<season>', data.season.id);
  // create req and url
  let request = new XMLHttpRequest();
  // setup request
  request.open('GET', url, true);
  request.setRequestHeader("Accept", "application/vnd.api+json");
  request.setRequestHeader("Authorization", "Bearer <key>".replace("<key>", data.key));
  // upon success
  request.onreadystatechange = function() {
    // if request is ready and successful
    requestHandler(this, function() {
      // localize data
      let tempData = JSON.parse(request.responseText).data;
      data[prop] = tempData[tempData.length - 1] || tempData.attributes.gameModeStats;
      pubg_URLS.counter++;
    });
  };
  request.send();
}

function pubgTable(data, tableNum) {
  // table information
  const thirdPersonData = [{header: 'SOLO', property: ['solo'], index: [0, 1], counter: 0}, {header: 'DUO',
  property: ['duo'], index: [0, 1], counter: 0}, {header: 'SQUAD', property: ['squad'], index: [0, 1], counter: 0}];
  const firstPersonData = [{header: 'SOLO-FIRST-PERSON', property: ['solo-fpp'], index: [0, 1], counter: 0}, {header: 'DUO-FIRST-PERSON',
  property: ['duo-fpp'], index: [0, 1], counter: 0}, {header: 'SQUAD-FIRST-PERSON', property: ['squad-fpp'], index: [0, 1], counter: 0}];
  const tableCells = [[{title: 'Wins', key: 'wins'}, {title: 'Games', key: 'roundsPlayed'}, {title: 'Top10', key: 'top10s'}, {title: 'Kills', key: 'kills'},
  {title: 'Headshots', key: 'kills'}], [{title: 'Assists', key: 'assists'}, {title: 'Damage', key: 'damageDealt'}, {title: 'Max Kills', key: 'roundMostKills'},
  {title: 'Longest Kill', key: 'longestTimeSurvived'}, {title: 'Survival', key: 'wins'}]];
  // initialize table styling
  let headerStyle = {'line-height': '125%'};
  let cellStyle = [{'font-weight': 'bold', 'display': 'block', 'font-size': '8pt'}, {'font-weight': 'normal', 'font-size': '9pt'},
  {'line-height': '110%'}];
  // setup display
  data = data.stats;
  tableNum === 0 ? createTable(data, [thirdPersonData, tableCells], [headerStyle, cellStyle]) : createTable(data, [firstPersonData, tableCells], [headerStyle, cellStyle]);
}
