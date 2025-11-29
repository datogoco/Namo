import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Providers from '../providers';
import App from '../App';

const AppRouter = () => (
  <BrowserRouter>
    <Providers>
      <App />
    </Providers>
  </BrowserRouter>
);

export default AppRouter;
