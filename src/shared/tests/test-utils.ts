import userEvent from '@testing-library/user-event';

function setupUserEvent() {
  return userEvent.setup();
}

export { setupUserEvent };

export { screen } from '@testing-library/react';
