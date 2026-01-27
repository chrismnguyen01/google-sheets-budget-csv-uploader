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

    // Only include negative amounts
    if (numericAmount >= 0) return;

    // Costco → Table 2 (Groceries)
    if (description.toLowerCase().includes("costco")) {
      needs.push([
        "Costco",
        numericAmount,
        "Groceries",
        postDate
      ]);
    } 
    // Everything else → Table 1 (Amazon)
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
