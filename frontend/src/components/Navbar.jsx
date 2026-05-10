import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-brand">
          <img src="/logo.svg" alt="Logo" className="nav-logo" />
          <span>Recetas de Pili</span>
        </Link>
      </div>
      <div className="navbar-cita-container">
        <div className="navbar-cita">"La cocina de Pili"</div>
        <div className="navbar-cita-explicacion">Recetas caseras con mucho cariño</div>
      </div>
      <div className="nav-right">
        {isAuthenticated && (
          <>
            <Link to="/new" className="nav-link">Nueva receta</Link>
            {isAdmin && (
              <Link to="/admin/users" className="nav-link">Administrar Usuarios</Link>
            )}
            <span className="nav-user">Hola, {user?.username}</span>
            <button onClick={() => logout(navigate)} className="nav-link">
              Cerrar sesión
            </button>
          </>
        )}
        {!isAuthenticated && (
          <Link to="/login" className="nav-link">Administrar web</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
