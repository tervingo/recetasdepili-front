import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const UserAdmin = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({ username: '', password: '', is_admin: false });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadUsers();
  }, [isAuthenticated, navigate]);

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/');
      setUsers(response.data);
    } catch {
      toast.error('Error al cargar la lista de usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/users/', newUser);
      toast.success('Usuario creado correctamente');
      setNewUser({ username: '', password: '', is_admin: false });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear usuario');
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`¿Eliminar al usuario ${username}?`)) {
      try {
        await axiosInstance.delete(`/users/${username}`);
        toast.success('Usuario eliminado correctamente');
        loadUsers();
      } catch {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="admin-container">
      <h2>Administración de Usuarios</h2>
      <div className="create-user-form">
        <h3>Crear Nuevo Usuario</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input type="text" id="username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input type="password" id="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required className="form-input" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={newUser.is_admin} onChange={e => setNewUser({ ...newUser, is_admin: e.target.checked })} />
              {' '}Administrador
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Crear Usuario</button>
        </form>
      </div>
      <div className="users-list">
        <h3>Usuarios Existentes</h3>
        <table className="users-table">
          <thead>
            <tr><th>Usuario</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.is_admin ? 'Administrador' : 'Usuario'}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.username)} className="btn btn-delete" disabled={user.username === 'admin'}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserAdmin;
