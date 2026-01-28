/**
 * Processes a Venmo CSV statement.
 *
 * Parses the CSV, extracts transactions, and categorizes them as "wants".
 * Venmo does not have any "needs" categories in this parser.
 * Amounts are normalized and signs are flipped:
 *   - Incoming payments (+) are treated as negative amounts (expenses)
 *   - Outgoing payments (-) are treated as positive amounts
 *
 * @param {string} csvText - Raw CSV text from a Venmo statement
 * @returns {{wants: Array<Array>, needs: Array<Array>}} Object containing:
 *          - wants: Array of transactions, each row:
 *              [note, amount, category, date]
 *          - needs: Empty array (Venmo has no needs)
 *
 * Notes:
 * - Skips "Standard Transfer" transactions
 * - Strips time from ISO datetime strings
 * - Amounts are numeric (sign adjusted)
 * - Notes are appended with payer/payee info
 */
function processVenmoCSV(csvText) {
  const rows = Utilities.parseCsv(csvText);
  const wants = [];
  const needs = []; // Venmo has nothing for needs

  // Find the header row index (where "ID" is)
  let startIndex = rows.findIndex(r => r[1] === "ID");
  if (startIndex === -1) startIndex = 0;

  for (let i = startIndex + 1; i < rows.length; i++) {
    let row = rows[i].map(cell => (cell ? cell.toString().trim() : ""));
    const id = row[1];
    const type = row[3];      // Type column
    const note = row[5] || "";
    const from = row[6] || "";
    const to = row[7] || "";
    let amountStr = row[8] || "";
    let dateTime = row[2] || "";

    if (!id || type === "Standard Transfer") continue;

    // Strip time from date
    if (dateTime.includes("T")) dateTime = dateTime.split("T")[0];

    // Remove $ and whitespace
    amountStr = amountStr.replace("$", "").trim();
    if (!amountStr) continue;

    let finalNote = note;

    // Flip the sign of the amount
    let numericAmount = Number(amountStr.replace("+", "").replace("-", ""));
    if (amountStr.startsWith("+")) {
      numericAmount = -numericAmount;      // + becomes - (incoming payment)
      finalNote += `, ${from}`;
    } else if (amountStr.startsWith("-")) {
      numericAmount = numericAmount;       // - stays + (outgoing payment)
      finalNote += `, ${to}`;
    }

    wants.push([finalNote, numericAmount, "Missing", dateTime]);
  }

  return { wants, needs };
}
