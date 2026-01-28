/**
 * Adds a custom "Transactions" menu to the Google Sheet
 * with an option to upload statement CSVs.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Transactions")
    .addItem("Upload Statement CSV", "showUploadDialog")
    .addToUi();
}

/**
 * Opens the HTML dialog for uploading CSV files.
 */
function showUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile("upload")
    .setWidth(500)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, "Upload Statement CSV");
}

/**
 * Finds the last filled row in a given column, starting from startRow.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search
 * @param {number} startRow - Row to start searching from
 * @param {number} col - Column to check
 * @returns {number} Last filled row number, or startRow-1 if none
 */
function getLastFilledRow(sheet, startRow, col) {
  const data = sheet.getRange(startRow, col, sheet.getMaxRows() - startRow + 1).getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i][0] !== "") return startRow + i;
  }
  return startRow - 1;
}

/**
 * Routes CSV text to the correct parser based on statement type.
 *
 * @param {string} csvText - Raw CSV text
 * @param {string} statementType - One of:
 *   "Capital One Venture X", "Capital One Savor One", "Chase Amazon", "Venmo"
 * @returns {{wants: Array<Array>, needs: Array<Array>}} Parsed transaction tables
 * @throws {Error} If statementType is unknown
 */
function processCSVWithType(csvText, statementType) {
  if (statementType === "Capital One Venture X") return processCapitalOneVentureXCSV(csvText);
  if (statementType === "Capital One Savor One") return processCapitalOneSavorOneCSV(csvText);
  if (statementType === "Chase Amazon") return processChaseCSV(csvText);
  if (statementType === "Venmo") return processVenmoCSV(csvText);
  throw new Error("Unknown statement type: " + statementType);
}

/**
 * Writes aggregated wants and needs tables to the active sheet.
 *
 * - Wants are written starting at column B, row 21
 * - Needs are written starting at column G, row 21
 * - After writing, both tables are sorted
 *
 * @param {Array<Object>} aggregatedResults - Array of parsed CSV results
 */
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

  // Sort tables after writing
  sortTables();
}

/**
 * Sorts the "wants" and "needs" tables on the sheet.
 *
 * - Wants: B21:E? sorted by column E ascending
 * - Needs: G21:J? sorted by column J ascending
 */
function sortTables() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // ---------- Wants: B21:E? ----------
  const table1StartRow = 21;
  const table1StartCol = 2; // column B
  const table1EndRow = getLastFilledRow(sheet, table1StartRow, table1StartCol);
  if (table1EndRow >= table1StartRow) {
    const table1Range = sheet.getRange(table1StartRow, table1StartCol, table1EndRow - table1StartRow + 1, 4);
    table1Range.sort([{ column: 5, ascending: true }]); // Sort by column E
  }

  // ---------- Needs: G21:J? ----------
  const table2StartRow = 21;
  const table2StartCol = 7; // column G
  const table2EndRow = getLastFilledRow(sheet, table2StartRow, table2StartCol);
  if (table2EndRow >= table2StartRow) {
    const table2Range = sheet.getRange(table2StartRow, table2StartCol, table2EndRow - table2StartRow + 1, 4);
    table2Range.sort([{ column: 10, ascending: true }]); // Sort by column J
  }
}
