// for optimizations and debugging
'use strict';

let haloCounter = {value: 0, mod: 2};

const halo_URLS = {base: 'https://www.haloapi.com',
url: [{url: '/profile/h5/profiles/<ign>/spartan?crop=portrait', key: 'SpartanImg', img: true},
{url: '/profile/h5/profiles/<ign>/emblem', key: 'EmblemImg', img: true},
{url: '/stats/h5/servicerecords/arena?players=<ign>', key: 'Arena'}, {url: '/stats/h5/players/<ign>/matches?count=3', key: 'Matches'}],
metadata: [{url: '/metadata/h5/metadata/seasons', key: 'Seasons'}, {url: '/metadata/h5/metadata/csr-designations', key: 'Designations'},
{url: '/metadata/h5/metadata/game-base-variants', key: 'Gamemodes'}, {url: '/metadata/h5/metadata/weapons', key: 'Weapons'}]};

function haloSearch(data) {
  // prepare new array (incase id changes)
  let metadata = [];
  // prepare urls
  for(let i = 0; i < halo_URLS.metadata.length; i++)
    metadata[i] = {url: halo_URLS.base.concat(halo_URLS.metadata[i].url.replace('<id>', data.id)), key: halo_URLS.metadata[i].key};
  // get data
  getMetaData(data, metadata, undefined);
  getHaloData(data);
  // after reqs are recieved
  setTimeout(function() {
    // prepare data
    simplifyHalo(data);
    // setup window
    initializeWindow();
    // create tables
    updateView(data, haloTable, haloCounter);
    loadView();
  }, 1000);
}

function getHaloData(data) {
  // iterate through all http requests
  for(let i = 0; i < halo_URLS.url.length; i++) {
    let url = {url: halo_URLS.base.concat(halo_URLS.url[i].url.replace('<ign>', data.Gamertag)),
    img: halo_URLS.url[i].img, key: halo_URLS.url[i].key};
    // create XML request
    let request = new XMLHttpRequest();
    // open asynchronous get request
    request.open('GET', url.url, true);
    setHeader(data, request);
    // instructions for when the message is recieved
    request.onreadystatechange = function() {
      // handle request
      requestHandler(this, function () {
        console.log(url.img);
        // parse data
        let parse = url.img ? request.responseURL : JSON.parse(request.responseText).Results;
        data[url.key] = parse;
      });
    };
    request.send();
  }
}

function simplifyHalo(data) {
  // simplify properties
  data.Arena = data.Arena[0].Result;
  data.Player = {EmblemImg: data.EmblemImg, SpartanRank: data.Arena.SpartanRank, Xp: data.Arena.Xp, Company: data.Company, ServiceTag: data.ServiceTag};
  // find top season
  data.Arena.ArenaStats.TopSeason = objectSearch(data.Arena.ArenaStats.HighestCsrSeasonId, data.Seasons, 'id');
  // find top playlist in that season
  data.Arena.ArenaStats.HighestCsrPlaylistId = objectSearch(data.Arena.ArenaStats.HighestCsrPlaylistId, data.Arena.ArenaStats.TopSeason.playlists, 'id').name;
  // change values to their names
  data.Arena.ArenaStats.HighestCsrSeasonId = data.Arena.ArenaStats.TopSeason.name;
  // find rank
  data.Arena.ArenaStats.HighestCsrAttained.DesignationId = objectSearch(data.Arena.ArenaStats.HighestCsrAttained.DesignationId,
  data.Designations, 'id').name;
  // find top weapon
  data.Arena.ArenaStats.WeaponWithMostKills.WeaponId = objectSearch(data.Arena.ArenaStats.WeaponWithMostKills.WeaponId.StockId,
  data.Weapons, 'id').name;
  // iterate through maps
  for(let match of data.Matches) {
    // swap gamemout name
    match.GameBaseVariantId = objectSearch(match.GameBaseVariantId, data.Gamemodes, 'id').name;
    // swap out game name
    match.GameBaseVariantId === 'Campaign' ? match.Players[0].GameRank = 'N/A' :
    match.Players[0].GameRank = objectSearch(match.Players[0].TeamId, match.Teams, 'Id').Rank;
  }
}

function haloTable(data, tableNum) {
  // show specific table
  tableNum === 1 ? addHaloStats(data, tableNum) :  addHaloCareer(data, tableNum);
}

function addHaloStats(data) {
  // table information
  const headerData = [{header: 'SPARTAN:', index: [0], property: ['Player']}, {header: 'ARENA CAREER:', index: [1, 2, 3], property: ['Arena', 'ArenaStats']}];

  const tableCells = [[{title: 'Emblem:',  key: 'EmblemImg', img: true}, {title: 'Level:',  key: 'SpartanRank'},
  {title: 'XP:',  key: 'Xp'}, {title: 'Service Tag:', key: 'ServiceTag'}, {title: 'Company:',  key: 'Name'}],

  [{title: 'Kills:', key: 'TotalSpartanKills'}, {title: 'Deaths:', key: 'TotalDeaths'}, {title: 'Wins:', key: 'TotalGamesWon'},
  {title: 'Losses:', key: 'TotalGamesLost'}, {title: 'Ties:', key: 'TotalGamesTied'}],

  [{title: 'Assists:', key: 'TotalAssists'}, {title: 'Headshots:', key: 'TotalHeadshots'}, {title: 'Melee Kills:', key: 'TotalMeleeKills'},
  {title: 'Assassinations:', key: 'TotalAssassinations'}, {title: 'Shoulder Kills:', key: 'TotalShoulderBashKills'}],

  [{title: 'Shots Fired:', key: 'TotalShotsFired'}, {title: 'Shots Landed:', key: 'TotalShotsLanded'}, {title: 'Grenade Kills:', key: 'TotalGrenadeKills'},
  {title: 'Power Weapon Grabs:', key: 'TotalPowerWeaponGrabs'}, {title: 'Power Weapon Kills:', key: 'TotalPowerWeaponKills'}]];
  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '180%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '165%'};
  // set icon
  $('#playerIcon').attr('src', propertySearch(data, 'SpartanImg'));
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}

function addHaloCareer(data) {
  const headerData = [{header: 'BEST SEASON:', property: ['Arena', 'ArenaStats'], index: [0]},
  {header: 'DEADLIEST ARENA WEAPON:', property: ['Arena', 'ArenaStats', 'WeaponWithMostKills'], index: [1]},
  {header: 'LAST 3 GAMES:', property: ['Matches'], index: [2, 2, 2], increment: -1}];

  const tableCells = [[{title: 'Season:', key: 'HighestCsrSeasonId'}, {title: 'Playlist:', key: 'HighestCsrPlaylistId'},
  {title: 'Rank:', key: 'DesignationId'}, {title: 'Tier:', key: 'Tier'}, {title: 'CSR:', key: 'Csr'}],

  [{title: 'Weapon:', key: 'WeaponId'}, {title: 'Kills:', key: 'TotalKills'}, {title: 'Headshots:', key: 'TotalHeadshots'},
  {title: 'Shots Fired:', key: 'TotalShotsFired'}, {title: 'Shots Landed:', key: 'TotalShotsLanded'}],

  [{title: 'Position:', key: 'GameRank', increment: true}, {title: 'Game Mode:', key: 'GameBaseVariantId'}, {title: 'Kills:', key: 'TotalKills'},
  {title: 'Deaths:', key: 'TotalDeaths'}, {title: 'Assists:', key: 'TotalAssists'}]];
  // initialize table styling
  let cellStyle = [{'font-weight': 'bold', 'display': 'block'}, {'font-weight': 'normal'}, {'line-height': '150%', 'font-size': '9pt'}];
  let headerStyle = {'line-height': '135%'};
  // set icon
  $('#playerIcon').attr('src', propertySearch(data, 'SpartanImg'));
  // setup display
  createTable(data, [headerData, tableCells], [headerStyle, cellStyle]);
}
