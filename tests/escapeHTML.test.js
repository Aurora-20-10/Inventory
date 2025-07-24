const { escapeHTML } = require('../js/main');

test('escapeHTML converts special characters', () => {
  expect(escapeHTML('<div>&Hello</div>')).toBe('&lt;div&gt;&amp;Hello&lt;/div&gt;');
});
