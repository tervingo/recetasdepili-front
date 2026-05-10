import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { CATEGORIES } from '../constants';

const SideMenu = () => {
  const [categories, setCategories] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axiosInstance.get('/recipes/');
      const categorized = response.data.reduce((acc, recipe) => {
        const category = recipe.category || 'Sin categoría';
        if (!acc[category]) acc[category] = [];
        acc[category].push(recipe);
        return acc;
      }, {});

      Object.keys(categorized).forEach(category => {
        categorized[category].sort((a, b) =>
          a.title.localeCompare(b.title, 'es', { sensitivity: 'base' })
        );
      });

      const ordered = {};
      CATEGORIES.forEach(cat => { if (categorized[cat]) ordered[cat] = categorized[cat]; });
      Object.keys(categorized).forEach(cat => { if (!ordered[cat]) ordered[cat] = categorized[cat]; });

      setCategories(ordered);
      setExpandedCategories(
        Object.keys(ordered).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
      );
    } catch (error) {
      console.error('Error al cargar las recetas:', error);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="side-menu">
      <h2 className="side-menu-title">Recetas</h2>
      <nav className="category-nav">
        {Object.entries(categories).map(([category, recipes]) => (
          <div key={category} className="category-section">
            <button
              className={`category-header ${expandedCategories[category] ? 'expanded' : ''}`}
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              <span className="expand-icon">{expandedCategories[category] ? '▼' : '▶'}</span>
            </button>
            {expandedCategories[category] && (
              <ul className="recipe-list">
                {recipes.map(recipe => (
                  <li key={recipe.id}>
                    <button
                      className="recipe-link"
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                    >
                      {recipe.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SideMenu;
