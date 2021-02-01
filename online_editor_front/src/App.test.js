import { render, screen } from '@testing-library/react';
import StartApp from './StartApp';

test('renders learn react link', () => {
  render(<StartApp />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
