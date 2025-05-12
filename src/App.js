import React, { useState } from 'react';
import { AuthProvider } from '/context/AuthContext.js' // Імпортуй AuthProvider
import AuthModal from './components/AuthModal';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthProvider>  {/* Обгортаємо весь додаток в AuthProvider */}
      <div>
        <button onClick={openAuthModal}>Увійти / Зареєструватися</button>
        {showAuthModal && <AuthModal onClose={closeAuthModal} setIsAuthenticated={setIsAuthenticated} />}
      </div>
    </AuthProvider>
  );
}

export default App;