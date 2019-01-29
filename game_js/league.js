// for optimizations and debugging
'use strict';

// maintain current server version
const leagueVersion = {league: 'v4'};

const league_URLS = {base: 'https://na1.api.riotgames.com',
url: ['/lol/champion-mastery/' + leagueVersion.league + '/scores/by-summoner/<id>',
'/lol/champion-mastery/' + leagueVersion.league + '/champion-masteries/by-summoner/<id>',
'/lol/league/' + leagueVersion.league + '/positions/by-summoner/<id>'],
metadata: [{url: 'http://ddragon.leagueoflegends.com/cdn/<ver>/data/en_US/champion.json', key: 'championData'}],
counter: 0};

function getLeagueVersion() {
  // create XML request
  let request = new XMLHttpRequest();
  // open asynchronous get request
  request.open('GET', "https://ddragon.leagueoflegends.com/realms/na.json", true);
  // instructions for when the message is recieved
  request.onreadystatechange = function() {
    // set league versions
    requestHandler(request, function() {
      leagueVersion.dataDragon= JSON.parse(request.responseText).v;
    });
  }
  // send get request
  request.send();
}

function leagueSearch(data) {
  data.data = Object.assign(retrieveLeague(data), data.data);
  // modify urls
  for(let i = 0; i < league_URLS.metadata.length; ++i)
    league_URLS.metadata[i].url = league_URLS.metadata[i].url.replace('<ver>', leagueVersion.dataDragon);
  // get data
  getMetaData(data, league_URLS.metadata, 'data');
  // after reqs are recieved
  setTimeout(function() {
    // prepare data
    simplifyLeague(data.data);
    // setup window
    updateView(data.data, leagueTable, undefined, league_URLS);
    initializeWindow();
    // create tables
    loadView();
  }, timeout.short);
}

function retrieveLeague(data) {
  // store initial search
  let player = {id: propertySearch(data, 'id'), profileIconId: propertySearch(data, 'profileIconId'), level: propertySearch(data, 'summonerLevel')};
  // iterate through all http requests
  for(let i = 0; i < league_URLS.url.length; ++i) {
    // swap out url tag
    let url = league_URLS.base.concat(league_URLS.url[i].replace('<id>', player.id).concat('?api_key=' + data.options.key));
    // create XML request
    let request = new XMLHttpRequest();
    // open asynchronous get request
    request.open('GET', url, true);
    // instructions for when the message is recieved
    request.onreadystatechange = function() {
      // handle request
      requestHandler(this, function () {
        // parse data
        let data = JSON.parse(request.responseText);
        switch(i) {
          case 0:
          player.masteryLevel = data;
          break;
          case 1:
          player.championMastery = data.slice(0, 4);
          break;
          case 2:
          // get solo queue ranked stats
          data = objectSearch('queueType', 'RANKED_SOLO_5x5', data);
          // save desired fields in object
          data === undefined ? player.rankedStats = {leagueName: 'N/A', tier: 'UNRANKED', rank: 'N/A', leaguePoints: '0', wins: '0', losses: '0'}
          : player.rankedStats = data;
          break;
        }
        ++league_URLS.counter;
      });
    };
    request.send();
  }
  return player;
}

function simplifyLeague(data) {
  data.id = data.id + '&';
  // iterate through array
  for(let topChamp of data.championMastery) {
    // return champ with the desired id
    let champ = objectSearch('key', topChamp.championId, data.championData);
    // localize src and name
    topChamp.champImage = 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/champion/'.replace('<ver>', champ.version) + champ.image.full;
    topChamp.champName = champ.name;
  }
}

function leagueTable(data) {
  // table information
  const headerData = [{header: 'SUMMONER', index: [0], property: ['']}, {header: 'RANKED', property: ['rankedStats'], index: [1]}];
  const tableCells = [[{title: 'Level', key: 'level'}, {title: 'Total Mastery', key: 'masteryLevel'}, {title: 'League', key: 'leagueName'}],
  [{title: 'Tier', key: 'tier'}, {title: 'Rank', key: 'rank'}, {title: 'LP', key: 'leaguePoints'},
  {title: 'Wins', key: 'wins'}, {title: 'Losses', key: 'losses'}]];

  const masteryData = [{header: 'TOP MASTERY', property: ['championMastery'], index: [0, 0], increment: -1}];
  const masteryCells = [[{title: '', key: 'champImage', img: true, increment: true, imgTitle: 'champName'}, {title: 'Champion', key: 'champName'}, {title: 'Level', key: 'championLevel'}, {title: 'Points', key: 'championPoints'},
  {title: '', key: 'champImage', img: true, increment: true, imgTitle: 'champName'}, {title: 'Champion', key: 'champName'}, {title: 'Level', key: 'championLevel'}, {title: 'Points', key: 'championPoints'}]];

  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '165%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '150%'};

  // set icon
  $('#playerIcon').prop('src', 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/profileicon/<profileIconId>.png'.replace('<ver>', leagueVersion.dataDragon).replace('<profileIconId>', data.profileIconId));

  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
  createTable(data, [masteryData, masteryCells], [headerStyle, cellStyle]);
}
