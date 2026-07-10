const React = require('react');
const MockIcon = () => React.createElement('div', { 'data-mock': 'icon' });

module.exports = new Proxy({}, {
  get: function(target, prop) {
    if (prop === '__esModule') return true;
    return MockIcon;
  }
});
