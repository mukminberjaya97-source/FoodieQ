import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './views/LoginView';
import { CustomerView } from './views/CustomerView';
import { SellerView } from './views/SellerView';
import { MyOrdersView } from './views/MyOrdersView';

const Main: React.FC = () => {
  const { currentView } = useApp();

  switch (currentView) {
    case 'login':
      return <LoginView />;
    case 'customer':
      return <CustomerView />;
    case 'seller':
      return <SellerView />;
    case 'my-orders':
      return <MyOrdersView />;
    default:
      return <LoginView />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;
