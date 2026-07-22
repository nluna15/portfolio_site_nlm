import { render, screen } from '../../test-utils';
import { InkPaper } from './InkPaper';

describe('InkPaper', () => {
  it('renders the masthead, sections, and footer', () => {
    render(<InkPaper />);
    expect(screen.getByRole('link', { name: 'Nehemias Luna' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AI Projects' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Selected Product Work' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Writing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle light / dark' })).toBeInTheDocument();
  });
});
