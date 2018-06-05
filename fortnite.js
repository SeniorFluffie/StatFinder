// for optimizations and debugging
'use strict';

function fortniteSearch(data) {
  // check for errors
  if(data.error !== undefined)
    alert('Player not found!');
  else {
    // setup window / icon / table
    initializeWindow();
    // set icon
    $('#playerIcon').attr('src', '/images/avatar_fortnite.png');
    // setup table
    fortniteTable(data);
  }
}

function fortniteTable(data) {
  console.log(data);
  // data to retrieve data / construct table
  const tableCells = [
  {category: 'lifeTimeStats', stats: [8, 9, 10, 11, 7, 2, 4, 5]},
  {category: 'stats', subcategory: 'p2', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top10', 'top25']},
  {category: 'stats', subcategory: 'p10', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top5', 'top12']},
  {category: 'stats', subcategory: 'p9', stats: ['top1', 'winRatio', 'kills', 'kd', 'kpg', 'matches', 'top3', 'top6']}];
  // cell labels and flag
  const cellHeader = ['OVERALL:', 'SOLO:', 'DUO:', 'SQUADS:'];
  // retrieve table
  var statTable = $('#statTable');
  // iterate through the table
  for(let i = 0; i < tableCells.length; i++) {
    // create header text
    let headerText = $('<th>', {align: 'center', colspan: tableCells[i].stats.length}).text(cellHeader[i]);
    let headerRow = $('<tr>', {class: 'tableHeader'}).append(headerText);
    // append header to table
    statTable.append(headerRow);
    // row to be added
    let tableRow = $('<tr>');
    // iterate through stats
    for(let j = 0; j < tableCells[i].stats.length; j++) {
      // cell to be added
      let tableCell, cellKey, cellValue;
      // if there is no sub-category (use different data)
      if(tableCells[i].subcategory === undefined) {
        // cell key (bolded) and cell value (not bolded)
        cellKey = $('<span>').css({'font-weight': 'bold', 'display': 'block'}).text(data[tableCells[i].category][tableCells[i].stats[j]].key + ':');
        cellValue = $('<span>').css('font-weight', 'normal').text(data[tableCells[i].category][tableCells[i].stats[j]].value);
      }
      else {
        // cell key (bolded) and cell value (not bolded)
        cellKey = $('<span>').css({'font-weight': 'bold', 'display': 'block'}).text(data[tableCells[i].category][tableCells[i].subcategory][tableCells[i].stats[j]].label + ':');
        cellValue = $('<span>').css('font-weight', 'normal').text(data[tableCells[i].category][tableCells[i].subcategory][tableCells[i].stats[j]].value);
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
