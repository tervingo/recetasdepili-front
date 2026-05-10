import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import SideMenu from './components/SideMenu';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import UserAdmin from './components/UserAdmin';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import CookiePolicy from './components/CookiePolicy';
import { initGA, logPageView } from './utils/analytics';

import './styles/base.css';
import './styles/nav.css';
import './styles/recipe-card.css';
import './styles/recipe-detail.css';
import './styles/forms.css';
import './styles/login.css';
import './styles/admin.css';
import './styles/footer.css';
import './styles/cookie.css';
import './styles/sidebar.css';
import './styles/tags.css';

function AppContent() {
  const location = useLocation();
  useEffect(() => { logPageView(); }, [location]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RecipeList />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/new" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
        <Route path="/recipes/:id/edit" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><UserAdmin /></PrivateRoute>} />
        <Route path="/cookies" element={<CookiePolicy />} />
      </Routes>
      <Footer />
      <CookieBanner />
    </>
  );
}

function App() {
  useEffect(() => { initGA(); }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <div className="app-container">
            <SideMenu />
            <main className="main-content-with-sidebar">
              <AppContent />
            </main>
          </div>
          <ToastContainer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
