/** A bounded structural check, not a database parser or search validation. */
export const MAX_QUERY_LENGTH = 1_000_000;

export function auditSearch(query) {
  if (typeof query !== 'string') throw new TypeError('The query must be text.');
  if (query.length > MAX_QUERY_LENGTH) throw new RangeError('Query exceeds 1,000,000 UTF-16 code units.');
  const issues = [];
  const stack = [];
  let quoteStart = null;
  let phrases = 0;
  let maxDepth = 0;
  let currentDepth = 0;
  let lastNonWhitespace = null;
  const add = (code, offset, message) => issues.push({code, offset, message});
  if (!query.trim()) add('EMPTY_QUERY', null, 'No search text was supplied.');
  for (let i = 0; i < query.length; i += 1) {
    const char = query[i];
    const previousNonWhitespace = lastNonWhitespace;
    if (!/\s/u.test(char)) lastNonWhitespace = i;
    if (char === '"') {
      if (quoteStart === null) quoteStart = i;
      else {
        if (!query.slice(quoteStart + 1, i).trim()) add('EMPTY_PHRASE', quoteStart, 'An empty quoted phrase needs review.');
        phrases += 1;
        quoteStart = null;
      }
      continue;
    }
    if (quoteStart !== null) continue;
    if (char === '(' || char === '[') {
      stack.push({char, offset: i});
      if (char === '(') currentDepth += 1;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === ')' || char === ']') {
      const expected = char === ')' ? '(' : '[';
      if (!stack.length) add('UNEXPECTED_CLOSE', i, `Closing ${char} has no opening delimiter.`);
      else if (stack.at(-1).char !== expected) add('CROSSED_DELIMITERS', i, `Closing ${char} does not match the most recent opening delimiter.`);
      else {
        const opening = stack.pop();
        if (char === ')') {
          currentDepth -= 1;
          if (previousNonWhitespace === opening.offset) add('EMPTY_GROUP', opening.offset, 'An empty parenthesis group needs review.');
        }
      }
    }
  }
  if (quoteStart !== null) add('UNCLOSED_QUOTE', quoteStart, 'A double quote is not closed.');
  for (const item of stack) add('UNCLOSED_DELIMITER', item.offset, `Opening ${item.char} is not closed.`);
  if (/[“”]/u.test(query)) add('SMART_QUOTES', query.search(/[“”]/u), 'Curly quotes may not behave like ASCII phrase delimiters in the target database.');
  if (/\\/u.test(query)) add('BACKSLASH', query.indexOf('\\'), 'Backslashes are not interpreted as escapes by this checker; inspect database-specific behavior.');
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/u.test(query)) add('CONTROL_CHARACTER', query.search(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/u), 'A non-printing control character needs review.');
  return {
    schemaVersion: 1,
    status: issues.length ? 'Structural issues to review' : 'No listed structural issue detected',
    characterCount: query.length,
    offsetConvention: 'zero-based UTF-16 code units',
    closedQuotedPhrases: phrases,
    maximumParenthesisDepth: maxDepth,
    manualReviewRequired: true,
    issues,
    limitations: [
      'Not a database parser: Boolean grammar, field tags, limits, controlled vocabulary, and phrase handling are not validated.',
      'No search was submitted. Retrieval counts, recall, precision, and scientific coverage are unknown.',
      'Inspect the exact query in its target platform and arrange appropriate peer review.'
    ]
  };
}
