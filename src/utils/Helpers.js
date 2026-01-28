/**
 * Returns the last row in a given column that contains a value,
 * starting the search from `startRow` downwards.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search.
 * @param {number} startRow - Row number to start searching from (1-based).
 * @param {number} col - Column number to check (1-based).
 * @returns {number} The row number of the last filled cell. Returns startRow - 1 if empty.
 */
function getLastFilledRow(sheet, startRow, col) {
  // Get all values from startRow to the bottom of the sheet in the specified column
  const values = sheet.getRange(startRow, col, sheet.getMaxRows() - startRow + 1).getValues();

  // Iterate backwards to find the last non-empty, non-null value
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "" && values[i][0] !== null) {
      return startRow + i;
    }
  }

  // If all cells are empty, return one row above startRow
  return startRow - 1;
}
