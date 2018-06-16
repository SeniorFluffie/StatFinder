// for optimizations and debugging
'use strict';

const league_URLS = {base: 'https://na1.api.riotgames.com',
url: ['/lol/champion-mastery/v3/scores/by-summoner/<id>',
'/lol/champion-mastery/v3/champion-masteries/by-summoner/<id>',
'/lol/league/v3/positions/by-summoner/<id>'],
metadata: [{url: 'http://ddragon.leagueoflegends.com/cdn/<ver>/data/en_US/champion.json', key: 'championData'}]};

const realmData = {version: '8.11.1', hasLoaded: false};

function leagueSearch(data) {
  if(data instanceof Error)
    alert('Player not found!');
  else {
    // store initial search
    let player = {id: propertySearch(data, 'id'), profileIconId: propertySearch(data, 'profileIconId'), level: propertySearch(data, 'summonerLevel')};
    // iterate through all http requests
    for(let i = 0; i < league_URLS.url.length; i++) {
      // swap out url tag
      let url = league_URLS.base.concat(league_URLS.url[i].replace('<id>', player.id).concat('?api_key=' + data.key));
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
            // as req differs
            data = data[0];
            // save desired fields in object
            data === undefined ? player.rankedStats = {leagueName: 'N/A', tier: 'UNRANKED', rank: 'N/A', leaguePoints: '0', wins: '0', losses: '0'}
            : player.rankedStats = data;
            break;
          }
        });
      };
      request.send();
    }
    // modify urls
    for(let i = 0; i < league_URLS.metadata.length; i++)
      league_URLS.metadata[i].url = league_URLS.metadata[i].url.replace('<ver>', realmData.version);
    // get data
    getMetaData(realmData, league_URLS.metadata, 'data');
    // after reqs are recieved
    setTimeout(function() {
      // setup window
      initializeWindow();
      // prepare data
      simplifyLeague(player);
      // create tables
      updateView(player, leagueTable);
      loadView();
    }, 500);
  }
}

function simplifyLeague(data) {
  // iterate through array
  for(let topChamp of data.championMastery) {
    // return champ with the desired id
    let champ = objectSearch(topChamp.championId, realmData.championData, 'key');
    // localize src and name
    topChamp.champImage = 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/champion/'.replace('<ver>', champ.version) + champ.image.full;
    topChamp.champName = champ.name;
  }
}

function leagueTable(data) {
  // table information
  const headerData = [{header: 'SUMMONER', index: [0], property: ['']}, {header: 'RANKED', property: ['rankedStats'], index: [1]},
  {header: 'MASTERY', property: ['championMastery'], index: [2], increment: -1}, {header: 'MASTERY', property: ['championMastery'], index: [2], increment: 1}];
  const tableCells = [[{title: 'Summoner ID', key: 'id'}, {title: 'Level', key: 'level'}, {title: 'Total Mastery', key: 'masteryLevel'}],

  [{title: 'League', key: 'leagueName'}, {title: 'Tier', key: 'tier'}, {title: 'Rank', key: 'rank'}, {title: 'LP', key: 'leaguePoints'},
  {title: 'Wins', key: 'wins'}, {title: 'Losses', key: 'losses'}],

  [{title: '', key: 'champImage', img: true, increment: true, imgTitle: 'champName'}, {title: 'Name', key: 'champName'}, {title: 'Level', key: 'championLevel'}, {title: 'Points', key: 'championPoints'},
  {title: '', key: 'champImage', img: true, increment: true, imgTitle: 'champName'}, {title: 'Name', key: 'champName'}, {title: 'Level', key: 'championLevel'}, {title: 'Points', key: 'championPoints'}]];
  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '155%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '150%'};
  // set icon
  $('#playerIcon').attr('src', 'http://ddragon.leagueoflegends.com/cdn/<ver>/img/profileicon/<profileIconId>.png'.replace('<ver>', realmData.version).replace('<profileIconId>', data.profileIconId));
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
