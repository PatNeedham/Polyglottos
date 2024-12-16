import { config } from 'dotenv';
config();

import app from './index';
import { serve } from '@hono/node-server';

const port = process.env.PORT || 3000;

serve(app, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
