// Add custom menu
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Transactions")
    .addItem("Upload Statement CSV", "showUploadDialog")
    .addToUi();
}

// Show HTML dialog
function showUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile("upload")
    .setWidth(500)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, "Upload Statement CSV");
}

// Helper: get last filled row in a column (from startRow downward)
function getLastFilledRow(sheet, startRow, col) {
  const data = sheet.getRange(startRow, col, sheet.getMaxRows() - startRow + 1).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] !== "") return startRow + i;
  }
  return startRow - 1;
}

// ---------- Aggregation Function ----------
// Receives CSV text and type, returns object {wants: [], needs: []}
function processCSVWithType(csvText, statementType) {
  if (statementType === "Capital One Venture X") return processCapitalOneVentureXCSV(csvText);
  if (statementType === "Capital One Savor One") return processCapitalOneSavorOneCSV(csvText);
  if (statementType === "Chase Amazon") return processChaseCSV(csvText);
  if (statementType === "Venmo") return processVenmoCSV(csvText);
  throw new Error("Unknown statement type: " + statementType);
}

function writeAggregatedTables(aggregatedResults) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let allWants = [];
  let allNeeds = [];

  aggregatedResults.forEach(res => {
    if (!res) return;
    allWants = allWants.concat(res.wants || []);
    allNeeds = allNeeds.concat(res.needs || []);
  });

  // Write Wants (column B)
  if (allWants.length > 0) {
    const startRow1 = getLastFilledRow(sheet, 21, 2) + 1;
    sheet.getRange(startRow1, 2, allWants.length, allWants[0].length).setValues(allWants);
  }

  // Write Needs (column G)
  if (allNeeds.length > 0) {
    const startRow2 = getLastFilledRow(sheet, 21, 7) + 1;
    sheet.getRange(startRow2, 7, allNeeds.length, allNeeds[0].length).setValues(allNeeds);
  }

  // ----------- Call sortTables AFTER writing all data -----------
  sortTables();
}

function sortTables() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // ---------- Wants: B21:E? ----------
  const table1StartRow = 21;
  const table1StartCol = 2; // column B
  const table1EndRow = getLastFilledRow(sheet, table1StartRow, table1StartCol);
  if (table1EndRow >= table1StartRow) {
    const table1Range = sheet.getRange(table1StartRow, table1StartCol, table1EndRow - table1StartRow + 1, 4);
    table1Range.sort([{ column: 5, ascending: true }]); // Sort by column E (5th in range)
  }

  // ---------- Needs: G21:J? ----------
  const table2StartRow = 21;
  const table2StartCol = 7; // column G
  const table2EndRow = getLastFilledRow(sheet, table2StartRow, table2StartCol);
  if (table2EndRow >= table2StartRow) {
    const table2Range = sheet.getRange(table2StartRow, table2StartCol, table2EndRow - table2StartRow + 1, 4);
    table2Range.sort([{ column: 10, ascending: true }]); // Sort by column J (4th in range)
  }
}
