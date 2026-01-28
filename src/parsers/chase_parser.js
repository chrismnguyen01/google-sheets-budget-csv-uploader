/**
 * Processes a Chase CSV statement.
 *
 * Parses the CSV, categorizes transactions into "wants" (Amazon / Shopping)
 * and "needs" (Costco / Groceries), and normalizes amounts.
 * Only negative amounts (expenses) are included.
 *
 * @param {string} csvText - Raw CSV text from a Chase statement
 * @returns {{wants: Array<Array>, needs: Array<Array>}} Object containing
 *          two arrays: wants and needs, each with rows:
 *          [vendor, amount, category, postDate]
 *
 * Notes:
 * - "Costco" transactions are classified as "needs" (Groceries)
 * - All other transactions are classified as "wants" (Shopping/Amazon)
 */
function processChaseCSV(csvText) {
  const rows = Utilities.parseCsv(csvText);
  rows.shift(); // remove header

  const wants = []; // Amazon / Shopping
  const needs = []; // Costco / Groceries

  rows.forEach(row => {
    let [transactionDate, postDate, description, category, type, amount, memo] = row;

    // Trim all string fields
    description = description ? description.trim() : "";
    postDate = postDate ? postDate.trim() : "";
    amount = amount ? amount.trim() : "";

    // Skip empty rows
    if (!description && !amount) return;

    const numericAmount = Number(amount);

    // Costco → Table 2 (Groceries)
    if (description.toLowerCase().includes("costco")) {
      needs.push([
        "Costco",
        numericAmount,
        "Groceries",
        postDate
      ]);
    } 
    // Everything else → Table 1 (Amazon / Shopping)
    else {
      wants.push([
        "Amazon",
        numericAmount,
        "Shopping",
        postDate
      ]);
    }
  });

  return { wants, needs };
}
