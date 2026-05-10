import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const CATEGORIES_ORDER = [
  ['Aperitivos', 'Tapas y Pinchos'],
  ['Primeros'],
  ['Segundos', 'Guarniciones'],
  ['Postres']
];

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerRow, setItemsPerRow] = useState(3);
  const containerRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const calculate = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 100;
        setItemsPerRow(Math.max(1, Math.floor(width / 300)));
      }
    };
    calculate();
    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, []);

  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: itemsPerRow, slidesToSlide: 1 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: Math.min(2, itemsPerRow), slidesToSlide: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1, slidesToSlide: 1 }
  };

  const getRecipesByCategories = (categories) =>
    recipes
      .filter(r => categories.includes(r.category))
      .sort((a, b) => a.title.localeCompare(b.title));

  const RecipeCard = ({ recipe }) => (
    <div className="recipe-card">
      <div className="recipe-image">
        {recipe.image_path
          ? <img src={recipe.image_path} alt={recipe.title} />
          : <div className="recipe-image-placeholder"><i className="fas fa-utensils"></i></div>
        }
      </div>
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-card-tags">
            {recipe.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="recipe-card-tag">{tag}</span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="recipe-card-tag-more">+{recipe.tags.length - 3}</span>
            )}
          </div>
        )}
        <div className="recipe-meta">
          <span>🕒 {recipe.cooking_time} minutos</span>
          <span>👥 {recipe.servings} personas</span>
        </div>
        <div className="recipe-actions">
          <Link to={`/recipes/${recipe.id}`} className="btn btn-view">Ver</Link>
          {isAuthenticated && (
            <>
              <Link to={`/recipes/${recipe.id}/edit`} className="btn btn-edit">Editar</Link>
              <button onClick={() => handleDelete(recipe.id)} className="btn btn-delete">Eliminar</button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => { fetchRecipes(); }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axiosInstance.get('/recipes/');
      setRecipes(response.data);
    } catch (error) {
      const msg = error.response
        ? `Error: ${error.response.status} - ${error.response.data.detail || error.response.data}`
        : 'Error al conectar con el servidor';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      try {
        await axiosInstance.delete(`/recipes/${id}`);
        setRecipes(recipes.filter(r => r.id !== id));
        toast.success('Receta eliminada correctamente');
      } catch {
        toast.error('Error al eliminar la receta');
      }
    }
  };

  if (loading) return <div className="loading">Cargando recetas...</div>;

  return (
    <div className="recipe-list" ref={containerRef}>
      <h2 className="recipe-list-title">Recetas de Pili</h2>
      {CATEGORIES_ORDER.map((categoryGroup, index) => {
        const categoryRecipes = getRecipesByCategories(categoryGroup);
        if (categoryRecipes.length === 0) return null;
        return (
          <div key={index} className="category-section">
            <h3 className="category-title">{categoryGroup.join(' y ')}</h3>
            <div className="carousel-wrapper">
              <Carousel
                responsive={responsive}
                infinite={categoryRecipes.length > itemsPerRow}
                className="recipe-carousel"
                itemClass="carousel-item-wrapper"
                containerClass="carousel-container"
                arrows={categoryRecipes.length > itemsPerRow}
                renderButtonGroupOutside={true}
                partialVisible={false}
                centerMode={false}
                swipeable={true}
                draggable={false}
                minimumTouchDrag={80}
                shouldResetAutoplay={false}
                rewind={false}
                rewindWithAnimation={false}
              >
                {categoryRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </Carousel>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecipeList;
