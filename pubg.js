// for optimizations and debugging
'use strict';

const pubg_URLS = {base: 'https://api.playbattlegrounds.com/shards/pc-na',
url: ['/seasons', '/players/<id>/seasons/<season>']};

function pubgSearch(data) {
  // save player data
  let player = {id: data.data[0].id, key: data.key};
  // retrieve current season
  retrieveStats(pubg_URLS.url[0], player, 'season');
  // retrieve seasonal data (using the retrieved data)
  setTimeout(function() {
    retrieveStats(pubg_URLS.url[1], player, 'stats');
  }, 500);
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow();
    // set icon
    $('#playerIcon').attr('src', '/images/icon_pubg.png');
    // fill table
    pubgTable(player);
  }, 1000);
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
    });
  };
  request.send();
}

function pubgTable(data) {
  // table information
  const headerData = [{header: 'SOLO & SOLO-FIRST-PERSON:', index: [0, 0], property: ['solo', 'solo-fpp'], counter: 0}, {header: 'DUO & DUO-FIRST-PERSON:', index: [0, 0],
  property: ['duo', 'duo-fpp'], counter: 0}, {header: 'SQUAD & SQUAD-FIRST-PERSON:', index: [0, 0], property: ['squad', 'squad-fpp'], counter: 0}];
  const tableCells = [[{title: 'Wins:', key: 'wins'}, {title: 'Games:', key: 'roundsPlayed'}, {title: 'Top10:', key: 'top10s'}, {title: 'Kills', key: 'kills'},
  {title: 'Headshots:', key: 'kills'}, {title: 'Assists:', key: 'assists'}, {title: 'Damage:', key: 'damageDealt'}, {title: 'Max Kills:', key: 'roundMostKills'},
  {title: 'Longest Kill:', key: 'longestTimeSurvived'}, {title: 'Survival:', key: 'wins'}]];
  // initialize table styling
  let headerStyle = {'line-height': '105%'};
  let cellStyle = [{'font-weight': 'bold', 'display': 'block', 'font-size': '8pt'}, {'font-weight': 'normal', 'font-size': '9pt'},
  {'line-height': '100%'}];
  // setup display
  data = data.stats;
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
