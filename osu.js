// for optimizations and debugging
'use strict';

const osu_URLS = {base: 'https://osu.ppy.sh/', url: ['/api/get_user_best?k=<key>&u=<ign>']};

function osuSearch(data) {
  // localize data
  let player = {stats: data[0], key: data.key};
  // set list (before timeout)
  retrieveMaps(osu_URLS.url[0], player, 'maps');
  // after reqs are recieved
  setTimeout(function() {
    // setup window
    initializeWindow();
    // set icon
    $('#playerIcon').attr('src', '/images/avatar_osu.png');
    // fill table
    osuTable(player);
  }, 500);
}

function retrieveMaps(url, data, prop) {
  // create req and url
  let request = new XMLHttpRequest();
  url = osu_URLS.base + url.replace('<key>', data.key).replace('<ign>', data.stats.username);
  // setup request
  request.open('GET', url, true);
  request.setRequestHeader('Access-Control-Allow-Origin', '*');
  // upon success
  request.onreadystatechange = function() {
    // if request is ready and successful
    requestHandler(this, function() {
      // save data
      data[prop] = JSON.parse(request.responseText).slice(0, 4);
    });
  };
  request.send();
}

function osuTable(data) {
  // table information
  const tableCells = [
    {title: ['Level:', 'Total Score:', 'Ranked Score:', 'Plays:', 'Accuracy:'], key: ['level', 'total_score', 'ranked_score', 'playcount', 'accuracy']},
    {title: ['Rank A:', 'Rank S:', 'Hidden S:', 'Rank SS:', 'Hidden SS:'], key: ['count_rank_a', 'count_rank_s', 'count_rank_sh', 'count_rank_ss', 'count_rank_ssh']},
    {title: ['PP Rank:', 'Country Rank:', '50 Count:', '100 Count:', '300 Count:'], key: ['pp_rank', 'pp_country_rank', 'count50', 'count100', 'count300']},
    {title: ['Beatmap ID:', 'Date:', 'Score:', 'Rank:', 'PP:'], key: ['beatmap_id', 'date', 'score', 'rank', 'pp'], category: 'maps'},
    {title: ['Maximum Combo:', '50 Count', '100 Count:', '300 Count:', 'Perfect:'], key: ['maxcombo', 'count50', 'count100', 'count300', 'perfect'], category: 'maps'}];
  const cellHeader = {index: [[0, 1, 2], [3, 4], [3, 4]], header: ['USER:', '1ST TOP SCORE:', '2ND TOP SCORE:'], counter: 0, numMaps: 2};
  // retrieve table
  var statTable = $('#statTable');
  // iterate through the table
  for(let i = 0; i < cellHeader.index.length; i++) {
    // create header text
    let headerText = $('<th>', {align: 'center', colspan: tableCells[i].title.length}).text(cellHeader.header[cellHeader.counter++]);
    let headerRow = $('<tr>', {class: 'tableHeader'}).append(headerText).css('line-height', '105%');
    // append header to table
    statTable.append(headerRow);
    for(let j = 0; j < cellHeader.index[i].length; j++) {
      // row to be added
      let tableRow = $('<tr>');
      // iterate through stats
      for(let k = 0; k < tableCells[cellHeader.index[i][j]].key.length; k++) {
        // cell to be added
        let tableCell, cellTitle, cellValue;
        // cell key (bolded) and cell value (not bolded)
        if(tableCells[cellHeader.index[i][j]].category === undefined) {
          cellTitle = $('<span>').css({'font-weight': 'bold', 'display': 'block'}).text(tableCells[cellHeader.index[i][j]].title[k]);
          cellValue = $('<span>').css('font-weight', 'normal').text(Math.round(data.stats[tableCells[cellHeader.index[i][j]].key[k]] * 100) / 100);
        } else {
          cellTitle = $('<span>').css({'font-weight': 'bold', 'display': 'block'}).text(tableCells[cellHeader.index[i][j]].title[k]);
          cellValue = $('<span>').css('font-weight', 'normal').text(data.maps[i % (cellHeader.numMaps + 1) - 1][tableCells[cellHeader.index[i][j]].key[k]]);
        }
        // append values to cell
        tableCell = $('<td>').append(cellTitle).append(cellValue).css({'line-height': '110%', 'font-size': '10pt'});
        // add cell to row
        tableRow.append(tableCell);
        }
        // add table row to table
        statTable.append(tableRow);
    }
  }
}
