// const fs = require('fs');
// const { parseForESLint } = require('jsonc-eslint-parser');

// function validateJSONCStrings(dataList) {
//   return dataList.map(({ participantId, format, code }) => {
//     try {
//       const result = parseForESLint(code, { filePath: 'input.jsonc' });  // 👈 加上 filePath
//       const diagnostics = result.services.getDiagnostics?.() || [];

//       return {
//         participantId,
//         format,
//         valid: diagnostics.length === 0,
//         errorMessage: diagnostics.map(d => d.message).join('; ')
//       };
//     } catch (e) {
//       return {
//         participantId,
//         format,
//         valid: false,
//         errorMessage: e.message
//       };
//     }
//   });
// }

// function main() {
//   const input = fs.readFileSync(0, 'utf-8');
//   const data = JSON.parse(input);
//   const results = validateJSONCStrings(data);
//   process.stdout.write(JSON.stringify(results, null, 2));
// }

// main();


// validate_jsonc_eslint.js
const fs = require('fs');
const { ESLint } = require("eslint");

async function validateJSONCStrings(dataList) {
  const eslint = new ESLint({
    overrideConfig: {
      parser: "jsonc-eslint-parser",
      plugins: ["jsonc"],
      overrides: [
        {
          files: ["*.jsonc"],
          rules: {
            "jsonc/quote-props": ["error", "always"],
            "quotes": ["error", "double"],
            "comma-dangle": ["error", "only-multiline"]
          }
        }
      ]
    }
  });

  const results = [];
  for (const { participantId, format, code } of dataList) {
    try {
      const lintResults = await eslint.lintText(code, { filePath: "input.jsonc" });
      const messages = lintResults[0].messages;
      results.push({
        participantId,
        format,
        valid: messages.length === 0,
        errorMessage: messages.map(m => m.message).join("; ")
      });
    } catch (e) {
      results.push({
        participantId,
        format,
        valid: false,
        errorMessage: e.message
      });
    }
  }
  return results;
}

async function main() {
  const input = fs.readFileSync(0, 'utf-8');
  const data = JSON.parse(input);
  const results = await validateJSONCStrings(data);
  process.stdout.write(JSON.stringify(results, null, 2));
}

main();
