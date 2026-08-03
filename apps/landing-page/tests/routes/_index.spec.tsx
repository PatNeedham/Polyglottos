import { createRemixStub } from '@remix-run/testing';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Index from '../../app/routes/_index';

function renderPage() {
  const RemixStub = createRemixStub([{ path: '/', Component: Index }]);
  return render(<RemixStub />);
}

beforeEach(() => {
  // jsdom has no matchMedia; the motion and theme hooks both depend on it.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
  // Nothing reveals without this; useReveal falls back to visible when absent.
  vi.stubGlobal('IntersectionObserver', undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('leads with the positioning headline', async () => {
  renderPage();
  const heading = await screen.findByRole('heading', { level: 1 });
  expect(heading).toHaveTextContent(/Learn languages on your terms/i);
});

test('surfaces the three pillars as landmark sections', async () => {
  renderPage();
  for (const name of [
    /people who aren't performing for a language app/i,
    /strongest privacy policy is a server you own/i,
    /change how it teaches/i,
  ]) {
    expect(await screen.findByRole('heading', { name })).toBeInTheDocument();
  }
});

test('offers both a hosted and a self-hosted entry point', async () => {
  renderPage();
  expect(
    await screen.findByRole('link', { name: /start learning — free/i })
  ).toHaveAttribute('href', '#start');
  expect(
    await screen.findByRole('link', { name: /run your own instance/i })
  ).toHaveAttribute('href', '#self-host');
});

test('the hero exercise responds to a visitor picking an answer', async () => {
  const user = userEvent.setup();
  renderPage();

  // The demo listens, transcribes, then asks — roughly 2.3s before options exist.
  const options = await screen.findByRole(
    'group',
    { name: /choose the word that completes/i },
    { timeout: 6000 }
  );
  const buttons = within(options).getAllByRole('button');
  expect(buttons.length).toBeGreaterThan(1);

  await user.click(buttons[0]);

  // Every option locks once an answer is committed.
  for (const button of within(options).getAllByRole('button')) {
    expect(button).toBeDisabled();
  }
});

test('has a skip link target and a single main landmark', async () => {
  renderPage();
  const main = await screen.findByRole('main');
  expect(main).toHaveAttribute('id', 'main');
});
