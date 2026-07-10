const React = require('react');

module.exports = {
  __esModule: true,
  default: function BottomSheetMock({ children }) { return React.createElement('div', { 'data-mock': 'bottom-sheet' }, children); },
  BottomSheetView: function BottomSheetViewMock({ children }) { return React.createElement('div', { 'data-mock': 'bottom-sheet-view' }, children); },
};
