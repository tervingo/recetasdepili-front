import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES, APP_ID } from '../constants';
import axiosInstance from '../utils/axios';

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', comment: '', description: '',
    ingredients: '', instructions: '',
    cooking_time: '', servings: '', category: '', tags: '', image_path: ''
  });
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadRecipe = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/recipes/${id}`);
        const recipe = response.data;
        setFormData({
          title: recipe.title || '',
          comment: recipe.comment || '',
          description: recipe.description || '',
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : recipe.ingredients || '',
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions || '',
          cooking_time: recipe.cooking_time || '',
          servings: recipe.servings || '',
          category: recipe.category || '',
          image_path: recipe.image_path || ''
        });
        setSelectedTags(recipe.tags || []);
      } catch {
        toast.error('Error al cargar la receta');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    loadRecipe();
  }, [id, navigate]);

  useEffect(() => {
    axiosInstance.get('/tags/')
      .then(r => setAvailableTags(r.data))
      .catch(() => toast.error('Error al cargar las etiquetas existentes'));
  }, []);

  const validateForm = () => {
    if (!formData.title.trim()) { toast.error('El título es obligatorio'); return false; }
    if (!formData.description.trim()) { toast.error('La descripción es obligatoria'); return false; }
    if (!formData.ingredients.trim()) { toast.error('Se requiere al menos un ingrediente'); return false; }
    if (!formData.instructions.trim()) { toast.error('Se requiere al menos una instrucción'); return false; }
    if (!formData.cooking_time || formData.cooking_time <= 0) { toast.error('El tiempo de cocción debe ser mayor que 0'); return false; }
    if (!formData.servings || formData.servings <= 0) { toast.error('El número de porciones debe ser mayor que 0'); return false; }
    if (!formData.category) { toast.error('La categoría es obligatoria'); return false; }
    return true;
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      if (!availableTags.includes(tag)) setAvailableTags([...availableTags, tag]);
      setNewTag('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const dataToSend = {
        title: formData.title,
        comment: formData.comment,
        description: formData.description,
        ingredients: formData.ingredients.split('\n').map(l => l.trim()).filter(l => l.length > 0),
        instructions: formData.instructions.split('\n').map(l => l.trim()).filter(l => l.length > 0),
        cooking_time: parseInt(formData.cooking_time),
        servings: parseInt(formData.servings),
        category: formData.category,
        tags: selectedTags,
        image_path: formData.image_path || null,
        app_id: APP_ID
      };
      if (id) {
        await axiosInstance.put(`/recipes/${id}`, dataToSend);
        toast.success('Receta actualizada correctamente');
      } else {
        await axiosInstance.post('/recipes/', dataToSend);
        toast.success('Receta creada correctamente');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail?.[0]?.msg || 'Error al guardar la receta');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Por favor, selecciona un archivo de imagen válido'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setIsUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const response = await axiosInstance.post('/upload-image/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data?.url) {
        setFormData(prev => ({ ...prev, image_path: response.data.url }));
        toast.success('Imagen subida correctamente');
      } else {
        throw new Error('No se recibió la URL de la imagen');
      }
    } catch {
      toast.error('Error al subir la imagen');
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar la imagen?')) {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, image_path: '' }));
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2>{id ? 'Editar Receta' : 'Nueva Receta'}</h2>

      {[
        { id: 'title', label: 'Título:', type: 'input' },
        { id: 'comment', label: 'Comentario:', type: 'input' },
        { id: 'description', label: 'Descripción:', type: 'textarea' },
        { id: 'ingredients', label: 'Ingredientes (uno por línea):', type: 'textarea' },
        { id: 'instructions', label: 'Instrucciones (una por línea):', type: 'textarea' },
      ].map(({ id: fid, label, type }) => (
        <div key={fid} className="form-group">
          <label htmlFor={fid}>{label}</label>
          {type === 'input'
            ? <input type="text" id={fid} value={formData[fid]} onChange={e => setFormData({ ...formData, [fid]: e.target.value })} required className="form-input" />
            : <textarea id={fid} value={formData[fid]} onChange={e => setFormData({ ...formData, [fid]: e.target.value })} required className="form-input" />
          }
        </div>
      ))}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cooking_time">Tiempo de cocción (minutos):</label>
          <input type="number" id="cooking_time" value={formData.cooking_time} onChange={e => setFormData({ ...formData, cooking_time: e.target.value })} required min="1" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="servings">Número de personas:</label>
          <input type="number" id="servings" value={formData.servings} onChange={e => setFormData({ ...formData, servings: e.target.value })} required min="1" className="form-input" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Categoría:</label>
        <select id="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required className="form-input">
          <option value="">Selecciona una categoría</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Etiquetas:</label>
        <div className="tags-input-container">
          <div className="selected-tags">
            {selectedTags.map((tag, i) => (
              <span key={i} className="tag">
                {tag}
                <button type="button" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} className="remove-tag">×</button>
              </span>
            ))}
          </div>
          <div className="tag-input-row">
            <input
              type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Nueva etiqueta" className="tag-input"
            />
            <button type="button" onClick={handleAddTag} className="btn btn-secondary">Añadir</button>
          </div>
        </div>
        {availableTags.length > 0 && (
          <div className="available-tags">
            <label className="available-tags-label">Etiquetas disponibles:</label>
            <div className="tags-cloud">
              {availableTags.filter(t => !selectedTags.includes(t)).map((tag, i) => (
                <button key={i} type="button" onClick={() => setSelectedTags([...selectedTags, tag])} className="available-tag-btn">{tag}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Imagen:</label>
        <div className="image-upload-container">
          {imagePreview || formData.image_path ? (
            <div className="image-preview">
              <img src={imagePreview || formData.image_path} alt="Vista previa" className="preview-image" />
              <button type="button" onClick={handleRemoveImage} className="btn btn-danger remove-image-btn">
                <i className="fas fa-trash"></i> Eliminar imagen
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <button type="button" onClick={() => document.getElementById('image-upload').click()} className="btn btn-primary upload-label" disabled={isUploadingImage}>
                {isUploadingImage ? <><i className="fas fa-spinner fa-spin"></i> Subiendo...</> : <><i className="fas fa-upload"></i> Seleccionar imagen</>}
              </button>
              <p className="upload-hint">Formatos permitidos: JPG, PNG, GIF</p>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? 'Guardando...' : (id ? 'Actualizar' : 'Crear')}
        </button>
        <button type="button" onClick={() => { if (window.confirm('¿Cancelar? Los datos no guardados se perderán.')) navigate('/'); }} className="btn btn-delete" disabled={isSaving}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default RecipeForm;
