// for optimizations and debugging
'use strict';

function fortniteSearch(data) {
  // data to retrieve data / construct table
  const tableHeaders = [
  {category: 'lifeTimeStats', stats: [8, 9, 10, 11, 7, 2, 4, 5]},
  {category: 'stats', subcategory: 'p2', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top10', 'top25']},
  {category: 'stats', subcategory: 'p10', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top5', 'top12']},
  {category: 'stats', subcategory: 'p9', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top3', 'top6']}];
  // cell labels and flag
  const gameModes = ['OVERALL:', 'SOLO:', 'DUO:', 'SQUADS:'];
  // check for errors
  if(data.error !== undefined)
    alert('Player not found!');
  else {
    initializeWindow(data.IGN);
    // set icon
    $('#playerIcon').attr('src', '/images/avatar_fortnite.png');
    // retrieve table
    var statTable = $('#statTable');
    // iterate through the table
    for(let i = 0; i < tableHeaders.length; i++) {
      // create header text
      let headerText = $('<th>', {align: 'center', colspan: '8'}).text(gameModes[i]);
      let headerRow = $('<tr>', {class: 'tableHeader'}).append(headerText);
      // append header to table
      statTable.append(headerRow);
      // row to be added
      let tableRow = $('<tr>');
      // iterate through stats
      for(let j = 0; j < tableHeaders[i].stats.length; j++) {
        // cell to be added
        let tableCell, cellKey, cellValue;
        // if there is no sub-category (use different data)
        if(tableHeaders[i].subcategory === undefined) {
          // cell key (bolded) and cell value (not bolded)
          cellKey = $('<span>').css('font-weight', 'bold').css('display', 'block').text(data[tableHeaders[i].category][tableHeaders[i].stats[j]].key + ':');
          cellValue = $('<span>').css('font-weight', 'normal').text(data[tableHeaders[i].category][tableHeaders[i].stats[j]].value);
        }
        else {
          // cell key (bolded) and cell value (not bolded)
          cellKey = $('<span>').css('font-weight', 'bold').css('display', 'block').text(data[tableHeaders[i].category][tableHeaders[i].subcategory][tableHeaders[i].stats[j]].label + ':');
          cellValue = $('<span>').css('font-weight', 'normal').text(data[tableHeaders[i].category][tableHeaders[i].subcategory][tableHeaders[i].stats[j]].value);
        }
        // append values to cell
        tableCell = $('<td>').append(cellKey).append(cellValue);
        // add cell to row
        tableRow.append(tableCell);
        }
        // add table row to table
        statTable.append(tableRow);
    }
  }
}
