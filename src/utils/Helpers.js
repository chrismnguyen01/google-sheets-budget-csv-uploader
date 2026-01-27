function getLastFilledRow(sheet, startRow, col) {
  const values = sheet.getRange(startRow, col, sheet.getMaxRows() - startRow + 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "" && values[i][0] !== null) return startRow + i;
  }
  return startRow - 1; // empty column
}