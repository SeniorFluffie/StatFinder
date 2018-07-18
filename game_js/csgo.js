// for optimizations and debugging
'use strict';

const csgo_URLS = {base: 'http://api.steampowered.com', url: '/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=<key>&steamid=<id>'};

function csgoSearch(data) {
  // intialize user
  let steamId = propertySearch(data, 'steamid');
  // retrieve csgo stats
  retrieveCsgo(data, steamId);
  // simplify data
  setTimeout(function() {
    // prepare data
    data.data = simplifyCsgo(data.data);
    // set icon
    $('#playerIcon').prop('src', '/images/avatar_csgo.png');
    // setup window
    updateView(data.data, csgoTable);
    initializeWindow();
    // create table
    loadView();
  }, timeout.long);
}

function retrieveCsgo(data, id) {
  // create req and url
  let request = new XMLHttpRequest();
  let url = csgo_URLS.base + csgo_URLS.url.replace('<key>', data.options.key).replace('<id>', id);
  // setup request
  request.open('GET', url, true);
  request.setRequestHeader('Access-Control-Allow-Origin', '*');
  // upon success
  request.onreadystatechange = function() {
    // if request is ready and successful
    requestHandler(this, function() {
      data.data = JSON.parse(request.responseText)['playerstats']['stats'];
    });
  };
  request.send();
}

function simplifyCsgo(data) {
  let stats = {};
  // change request from array to object
  data.forEach(function(element) {
    // set as object property
    stats[element.name] = element.value;
    // add dollar signs
    if(element.name.includes('money'))
      stats[element.name] = ('$').concat(stats[element.name]);
    // change time format
    else if(element.name.includes('time_played'))
      stats[element.name] = String((stats[element.name] /= 360).toFixed(2)).concat(' hours');
  });
  // search through properties to find best data
  let bestStats = [{prop: 'best_weapon', prefix: 'total_kills_', escape: true}, {prop: 'best_hit', prefix: 'total_hits_', escape: true, restrict: ['total_shots_hit', 'total_shots_fired']},
  {prop: 'best_wins', prefix: 'total_wins_map_'}, {prop: 'best_map', prefix: 'total_rounds_map_'}];
  // iterate through the stats
  for(let stat of bestStats) {
    // intialize text
    let text, best;
    // find best stat
    stat.restrict ? best = findBest(stats, stat.prefix, stat.restrict) : best = findBest(stats, stat.prefix, ['']);
    // concat string
    text = best + ': ' + stats[stat.prefix + best];
    // add in escape char
    stat.escape ? stats[stat.prop] = '&' + text : stats[stat.prop] = text;
  }
  return stats;
}

function findBest(data, prefix, restrict) {
  // intialize flag
  let counter;
  // iterate through keys
  for(let prop in data)
    // check if correct property (and isnt a restriction)
    if(prop.includes(prefix) && prop !== prefix && !restrict.find(function(element) {
      return prop !== element && prop.includes(element);
    }))
    // if greater value, swap it
    if(!counter || data[counter] < data[prop])
      counter = prop;
  // remove prefix
  return counter ? counter.replace(prefix, '') : 'N/A';
}

function csgoTable(data) {
  // table information
  const headerData = [{header: 'CAREER', index: [0, 1, 2, 3]}, {header: 'BEST', property: ['maps'], index: [4]},
  {header: 'LAST MATCH', property: ['maps'], index: [5, 6]}];

  const tableCells = [[{title: 'Kills', key: 'total_kills'}, {title: 'Deaths', key: 'total_deaths'}, {title: 'Matches Won', key: 'total_matches_won'},
  {title: 'Matches', key: 'total_matches_played'}],

  [{title: 'Damage', key: 'total_damage_done'}, {title: 'MVPs', key: 'total_mvps'}, {title: 'Rounds Won', key: 'total_wins'},
  {title: 'Rounds Played', key: 'total_rounds_played'}],

  [{title: 'CS Source Time', key: 'total_time_played'}, {title: 'Revenges', key: 'total_revenges'}, {title: 'Money Earned', key: 'total_money_earned'},
  {title: 'Dominations', key: 'total_dominations'}],

  [{title: 'Headshot Kills', key: 'total_kills_headshot'}, {title: 'Knife Kills', key: 'total_kills_knife'}, {title: 'Plants', key: 'total_planted_bombs'},
  {title: 'Defuses', key: 'total_defused_bombs'}],

  [{title: 'Weapon Kills', key: 'best_weapon'}, {title: 'Shots Hit', key: 'best_hit'}, {title: 'Map Wins', key: 'best_wins'},
  {title: 'Map Played', key: 'best_map'}],

  [{title: 'Kills', key: 'last_match_kills'}, {title: 'Deaths', key: 'last_match_deaths'}, {title: 'Round Wins', key: 'last_match_wins'},
  {title: 'Rounds Played', key: 'last_match_rounds'}],

  [{title: 'Damage', key: 'last_match_damage'}, {title: 'MVPs', key: 'last_match_mvps'}, {title: 'Money Spent', key: 'last_match_money_spent'},
  {title: 'Dominations', key: 'last_match_dominations'}]];

  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '120%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '100%'};

  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
