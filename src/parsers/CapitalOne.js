function processCapitalOneVentureXCSV(csvText) {
  const rows = Utilities.parseCsv(csvText);
  rows.shift(); // remove header

  const categoryMap = {
    "Merchandise": "Shopping",
    "Other Travel": "Travel",
    "Internet": "Entertainment",
    "Other Services": "Entertainment"
  };

  const wants = [];
  const needs = [];

  rows.forEach(row => {
    const [transactionDate, postedDate, cardNo, description, category, debit, credit] = row;

    // Skip irrelevant or empty rows
    if (!description && !debit && !credit) return;
    if (category === "Payment/Credit") return;

    const desc = description ? description.trim() : "";
    const descLower = desc.toLowerCase();

    // Determine amount (credit as negative if debit empty)
    let finalAmount = debit;
    if ((!debit || debit === "") && credit) {
      finalAmount = -Number(credit);
    }

    finalAmount = Number(finalAmount);
    if (isNaN(finalAmount)) return;

    // Transportation → wants
    if (
      descLower.includes("metro") ||
      descLower.includes("uber") ||
      descLower.includes("lyft")
    ) {
      wants.push([
        desc,
        finalAmount,
        "Transportation",
        postedDate
      ]);
      return;
    }

    // Gas → needs
    if (category === "Gas/Automotive") {
      needs.push([
        desc,
        finalAmount,
        "Gas",
        postedDate
      ]);
      return;
    }

    // Default → wants
    const finalCategory = categoryMap[category] || category;
    wants.push([
      desc,
      finalAmount,
      finalCategory,
      postedDate
    ]);
  });

  return { wants, needs };
}

function processCapitalOneSavorOneCSV(csvText) {
  const rows = Utilities.parseCsv(csvText);
  rows.shift(); // remove header

  const categoryMap = {
    "Merchandise": "Groceries",
    "Other Travel": "Travel",
    "Internet": "Entertainment",
    "Other Services": "Entertainment"
  };

  const wants = []; // Dining → Table 1
  const needs = []; // Groceries → Table 2

  rows.forEach(row => {
    const [transactionDate, postedDate, cardNo, description, category, debit, credit] = row;

    // Skip irrelevant or completely empty rows
    if (!description && !debit && !credit) return; // empty row
    if (category === "Payment/Credit") return;

    let finalDebit = debit;
    if ((!debit || debit === "") && credit) finalDebit = -Number(credit);

    const finalCategory = categoryMap[category] || category;
    const outputRow = [description, finalDebit, finalCategory, postedDate];

    if (finalCategory === "Dining") wants.push(outputRow);
    else if (finalCategory === "Groceries") needs.push(outputRow);
  });

  return { wants, needs };
}
