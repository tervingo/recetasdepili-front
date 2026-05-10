import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadRecipe = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/recipes/${id}`);
        if (response.data) {
          setRecipe({ ...response.data, id: response.data.id || response.data._id });
        } else {
          toast.error('No se encontró la receta');
        }
      } catch {
        toast.error('Error al cargar la receta');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    loadRecipe();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        await axiosInstance.delete(`/recipes/${id}`);
        toast.success('Receta eliminada correctamente');
        navigate('/');
      } catch {
        toast.error('Error al eliminar la receta');
      }
    }
  };

  if (isLoading) return <div className="loading">Cargando...</div>;
  if (!recipe) return <div className="error">No se encontró la receta</div>;

  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <h2>{recipe.title}</h2>
        {isAuthenticated && recipe.id && (
          <div className="recipe-admin-actions">
            <Link to={`/recipes/${recipe.id}/edit`} className="btn btn-edit">Editar</Link>
            <button onClick={handleDelete} className="btn btn-delete">Eliminar</button>
          </div>
        )}
      </div>

      {recipe.image_path && (
        <div className="recipe-image-container">
          <img src={recipe.image_path} alt={recipe.title} className="recipe-image" />
        </div>
      )}

      <div className="recipe-content">
        <div className="recipe-description">
          <h3>Descripción</h3>
          <p>{recipe.description}</p>
        </div>
        {recipe.comment && (
          <div className="recipe-comment">
            <h3>Comentario</h3>
            <p>{recipe.comment}</p>
          </div>
        )}
        <div className="recipe-metadata">
          <span><i className="far fa-clock"></i> {recipe.cooking_time} minutos</span>
          <span><i className="fas fa-user-friends"></i> {recipe.servings} personas</span>
          <span><i className="fas fa-tag"></i> {recipe.category}</span>
        </div>
        <div className="recipe-section">
          <h3>Ingredientes</h3>
          <ul>{recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div className="recipe-section">
          <h3>Instrucciones</h3>
          <ol>{recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}</ol>
        </div>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-tags">
            <h3>Etiquetas</h3>
            <div className="tags-container">
              {Array.from(recipe.tags).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="recipe-footer">
        <button onClick={() => window.print()} className="btn btn-print">
          <i className="fas fa-print"></i> Imprimir
        </button>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Volver</button>
      </div>
    </div>
  );
};

export default RecipeDetail;
