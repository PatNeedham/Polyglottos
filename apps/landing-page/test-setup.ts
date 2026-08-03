import { installGlobals } from '@remix-run/node';
// `/vitest` registers the matchers with expect. Importing `/matchers` only
// exposes them as values, which leaves toBeInTheDocument & co. undefined.
import '@testing-library/jest-dom/vitest';
installGlobals();
