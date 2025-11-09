// frontend/src/App.tsx
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './graphql/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './design-system';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </ThemeProvider>
  );
}

export default App;
