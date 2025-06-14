// src/components/ContentEditor.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Save, Eye, Trash2, Edit3, Type, Info, Text, GripVertical, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Default state for a new, empty page. Used when no initialContent is provided.
const defaultContent = {
  title: '',
  description: '',
  category: '',
  tags: [],
  sections: [],
};

// The component is now a "dumb" UI component. It receives its initial state and save handler from a parent.
const ContentEditor = ({ initialContent = defaultContent, onSave, saveButtonText = 'Sauvegarder' }) => {
  const [content, setContent] = useState(initialContent);
  const [activeSection, setActiveSection] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());

  // This effect ensures that if the parent component passes new initialContent,
  // the editor's state resets to that new content. This is crucial for editing.
  useEffect(() => {
    setContent(initialContent);
    // When content is loaded for editing, expand all sections that have children for better UX
    const initiallyExpanded = new Set(
        initialContent.sections
            .filter(s => initialContent.sections.some(child => child.parentId === s.id))
            .map(s => s.id)
    );
    setExpandedSections(initiallyExpanded);
  }, [initialContent]);

  const categories = [
    'Cardiologie', 'Pneumologie', 'Neurologie', 'Gastroentérologie',
    'Endocrinologie', 'Rhumatologie', 'Dermatologie', 'Urologie',
  ];
  const sectionTypes = [
    { value: 'expandable', label: 'Section Extensible' },
    { value: 'raw_text', label: 'Texte Brut' },
    { value: 'info_box', label: 'Boîte d\'Information' },
    { value: 'image', label: 'Image' },
  ];
  const themeColors = [
    { label: 'Bleu', value: '#e0f2fe', highlight: '#0284c7' },
    { label: 'Vert', value: '#dcfce7', highlight: '#16a34a' },
    { label: 'White', value: '#ffffff', highlight: '#f1f5f9' },
    { label: 'Rouge', value: '#fee2e2', highlight: '#dc2626' },
    { label: 'Violet', value: '#f5f3ff', highlight: '#7c3aed' },
    { label: 'Gris', value: '#f3f4f6', highlight: '#4b5563' },
  ];
  const textColors = [
    { label: 'Blanc', value: '#ffffff' },
    { label: 'Noir', value: '#000000' },
    { label: 'Bleu Foncé', value: '#1e40af' },
    { label: 'Vert Foncé', value: '#166534' },
    { label: 'Rouge Foncé', value: '#991b1b' },
    { label: 'Violet Foncé', value: '#581c87' },
    { label: 'Gris Foncé', value: '#374151' },
  ];
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeSection = content.sections.find(s => s.id === active.id);
      const overSection = content.sections.find(s => s.id === over.id);

      if (!activeSection || !overSection || activeSection.parentId !== overSection.parentId) {
        return;
      }

      const parentId = activeSection.parentId;
      const siblings = getSectionsByParent(parentId);
      const oldIndex = siblings.findIndex(s => s.id === active.id);
      const newIndex = siblings.findIndex(s => s.id === over.id);

      const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);
      const updatedSiblings = reorderedSiblings.map((sibling, index) => ({
        ...sibling,
        order: index,
      }));

      setContent(prev => {
        const otherSections = prev.sections.filter(s => s.parentId !== parentId);
        return {
          ...prev,
          sections: [...otherSections, ...updatedSiblings].sort((a, b) => {
            if (a.parentId === b.parentId) return a.order - b.order;
            return a.parentId ? 1 : -1;
          }),
        };
      });
    }
  }

  function SortableSectionTreeItem({ section, level = 0 }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: section.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const hasChildren = getSectionsByParent(section.id).length > 0;
    const isExpanded = expandedSections.has(section.id);

    const getIconForType = (type) => {
      switch (type) {
        case 'raw_text':
          return <Text className="w-4 h-4 text-gray-500" />;
        case 'info_box':
          return <Info className="w-4 h-4 text-blue-500" />;
        case 'image':
          return <ImageIcon className="w-4 h-4 text-gray-500" />;
        default:
          return null;
      }
    };

    return (
      <div ref={setNodeRef} style={style}>
        <div
          className={`flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 ${
            activeSection === section.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          style={{ marginLeft: `${level * 20}px`, backgroundColor: '#f9fafb' }}
          onClick={() => setActiveSection(section.id)}
        >
          <button {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700">
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex items-center flex-1 truncate">
            <span className="mr-2">
              {hasChildren ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpandSection(section.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <span className="text-sm font-bold">{isExpanded ? '-' : '+'}</span>
                </button>
              ) : (
                <span className="inline-block w-5 ml-1">{getIconForType(section.type)}</span>
              )}
            </span>
            <span className="text-sm font-medium text-gray-800 truncate pr-4">
              {section.type === 'image' ? 'Image' : section.title || (section.type === 'raw_text' ? 'Texte Brut' : `Section (sans titre)`)}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addSection(section.id);
              }}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
              title="Ajouter sous-section"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSection(section.id);
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && <SectionList parentId={section.id} level={level + 1} />}
      </div>
    );
  }

  function SectionList({ parentId = null, level = 0 }) {
    const sections = getSectionsByParent(parentId);
    const sectionIds = sections.map(s => s.id);
    return (
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1 mt-1">
          {sections.map(section => (
            <SortableSectionTreeItem key={section.id} section={section} level={level} />
          ))}
        </div>
      </SortableContext>
    );
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  const addSection = (parentId = null) => {
    const newSection = {
      id: Date.now(),
      type: 'expandable',
      title: '',
      content: '',
      contentDelta: null,
      parentId,
      isExpanded: true,
      backgroundColor: '#f9fafb',
      highlightColor: '#0284c7',
      titleTextColor: '#ffffff',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#e0f2fe',
      width: '100%',
      alignment: 'center',
      order: parentId
        ? content.sections.filter(s => s.parentId === parentId).length
        : content.sections.filter(s => !s.parentId).length,
      file: null,
      imageData: '',
    };
    setContent(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setActiveSection(newSection.id);
  };

  const updateSection = (sectionId, updates) => {
    setContent(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const newSection = { ...section, ...updates };
          if (updates.type && updates.type !== section.type) {
            if (updates.type === 'image') {
              newSection.content = '';
              newSection.contentDelta = null;
              newSection.imageData = '';
              newSection.file = null;
              newSection.backgroundColor = '#ffffff';
              newSection.borderWidth = 0;
              newSection.borderStyle = 'solid';
              newSection.borderColor = '#e0f2fe';
              newSection.width = '100%';
              newSection.alignment = 'center';
            }
          }
          return newSection;
        }
        return section;
      }),
    }));
  };

  const deleteSection = (sectionId) => {
    const allIdsToDelete = [sectionId, ...getChildrenIds(sectionId)];
    setContent(prev => ({
      ...prev,
      sections: prev.sections.filter(section => !allIdsToDelete.includes(section.id)),
    }));
    if (allIdsToDelete.includes(activeSection)) {
      setActiveSection(null);
    }
  };

  const getChildrenIds = (parentId) => {
    const children = content.sections.filter(s => s.parentId === parentId);
    let allChildrenIds = children.map(c => c.id);
    children.forEach(child => {
      allChildrenIds = [...allChildrenIds, ...getChildrenIds(child.id)];
    });
    return allChildrenIds;
  };

  const getSectionsByParent = (parentId = null) => {
    return content.sections
      .filter(s => s.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const toggleExpandSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.has(sectionId) ? newSet.delete(sectionId) : newSet.add(sectionId);
      return newSet;
    });
  };

  const handleImageUpload = (e, sectionId) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateSection(sectionId, { 
        file: file,
        imageData: event.target.result 
      });
    };
    reader.readAsDataURL(file);
  };

  const PreviewSection = ({ section, level = 0 }) => {
    const children = getSectionsByParent(section.id);
    if (section.type === 'image') {
      if (!section.imageData) {
        return <div className="text-gray-500">Aucune image sélectionnée</div>;
      }
      const imageStyle = {
        width: section.width || '100%',
        height: 'auto',
        backgroundColor: section.backgroundColor || 'transparent',
        border: `${section.borderWidth || 0}px ${section.borderStyle || 'solid'} ${section.borderColor || '#e0f2fe'}`,
        display: 'block',
      };
      const containerStyle = {
        textAlign: section.alignment || 'center',
        marginBottom: '1rem',
      };
      return (
        <div style={containerStyle}>
          <img src={section.imageData} alt="Section Image" style={imageStyle} />
        </div>
      );
    }

    if (section.type === 'raw_text') {
      const hasContent = section.content && section.content.trim() !== '' && section.content !== '<p><br></p>';
      return (
        <div className="ql-snow" style={{ marginLeft: `${level * 10}px` }}>
          <div 
            className="ql-editor" 
            dangerouslySetInnerHTML={{ __html: section.content }} 
            style={{ 
              minHeight: hasContent ? 'auto' : '0px',
              padding: hasContent ? '12px 15px' : '0px',
              display: hasContent ? 'block' : 'none'
            }} 
          />
        </div>
      );
    }

    if (section.type === 'info_box') {
      const hasContent = section.content && section.content.trim() !== '' && section.content !== '<p><br></p>';
      return (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-blue-50"
          style={{
            marginLeft: `${level * 10}px`,
            minHeight: hasContent ? 'auto' : '0px',
            padding: hasContent ? '16px' : '0px',
            display: hasContent ? 'flex' : 'none'
          }}
        >
          <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <div className="ql-snow flex-1">
            <div className="ql-editor !p-0" dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        </div>
      );
    }

    const hasContent = section.content && section.content.trim() !== '' && section.content !== '<p><br></p>';

    return (
      <div className="mb-2" style={{ marginLeft: `${level * 10}px` }}>
        <div className="border rounded-lg bg-white overflow-hidden shadow-sm" style={{ border: 'none' }}>
          <div
            className="flex items-center justify-between p-3 cursor-pointer"
            style={{ 
              backgroundColor: section.highlightColor || '#0284c7',
              color: section.titleTextColor || '#ffffff',
              border: `${section.borderWidth || 0}px ${section.borderStyle || 'solid'} ${section.borderColor || '#e0f2fe'}`,
              borderRadius: '0.5rem'
            }}
            onClick={() => updateSection(section.id, { isExpanded: !section.isExpanded })}
          >
            <h3 className="font-semibold">{section.title}</h3>
            <span className="text-sm font-bold">{section.isExpanded ? '-' : '+'}</span>
          </div>
          {section.isExpanded && hasContent && (
            <div 
              style={{ 
                backgroundColor: section.backgroundColor || '#f9fafb',
                marginTop: '2px',
                borderRadius: '0 0 0.5rem 0.5rem'
              }}
            >
              <div className="p-3 text-sm text-gray-700 ql-snow">
                <div className="ql-editor" dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
              {children.length > 0 && (
                <div className="p-3 space-y-2 border-t">
                  {children.map(child => (
                    <PreviewSection key={child.id} section={child} level={level + 1} />
                  ))}
                </div>
              )}
            </div>
          )}
          {section.isExpanded && !hasContent && children.length > 0 && (
            <div 
              style={{ 
                backgroundColor: section.backgroundColor || '#f9fafb',
                marginTop: '2px',
                borderRadius: '0 0 0.5rem 0.5rem'
              }}
            >
              <div className="p-3 space-y-2">
                {children.map(child => (
                  <PreviewSection key={child.id} section={child} level={level + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // REFACTORED: This function no longer calls the API directly.
  // It calls the `onSave` prop passed down from the parent component.
  const handleSave = async () => {
    if (!content.title.trim()) {
      alert('Veuillez entrer un titre');
      return;
    }
    if (!content.category.trim()) {
        alert('Veuillez sélectionner une catégorie');
        return;
    }
    
    setSaving(true);
    try {
      // The parent component (CreatePage or EditPage) provides the onSave function,
      // which contains the actual API logic (POST or PUT).
      await onSave(content);
    } catch (error) {
      // The parent component is responsible for showing the error alert.
      // We re-throw the error so the parent knows the operation failed.
      console.error("Save operation failed in parent component.", error);
    } finally {
      setSaving(false);
    }
  };
  
  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50 py-4 z-10">
          <h1 className="text-2xl font-bold text-gray-800">Aperçu - {content.title}</h1>
          <button
            onClick={() => setIsPreview(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" /> Modifier
          </button>
        </div>
        <div className="max-w-lg mx-auto bg-white rounded-lg p-4 shadow-lg">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg mb-4">
            <h2 className="font-bold text-xl">{content.title}</h2>
          </div>
          <div className="space-y-4 p-2">
            <p className="text-sm text-gray-700 mb-4">{content.description}</p>
            {getSectionsByParent().map(section => (
              <PreviewSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6 border-b border-blue-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Éditeur de Contenu</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPreview(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Aperçu
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'En cours...' : saveButtonText}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium mb-3 text-gray-700">Informations générales</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Titre principal"
                />
                <textarea
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                  rows="3"
                  placeholder="Description courte..."
                />
                <select
                  value={content.category}
                  onChange={(e) => setContent(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-700">Structure</h3>
                <button
                  onClick={() => addSection()}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Section
                </button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {getSectionsByParent().length > 0 ? (
                    <SectionList />
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-4">
                      Cliquez sur "+ Section" pour commencer.
                    </p>
                  )}
                </div>
              </DndContext>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeSection ? (
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                {(() => {
                  const section = content.sections.find(s => s.id === activeSection);
                  if (!section) return null;
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Type de section</label>
                        <select
                          value={section.type}
                          onChange={(e) => updateSection(activeSection, { type: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        >
                          {sectionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {section.type !== 'raw_text' && section.type !== 'image' && (
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Titre de la section</label>
                          <input
                            type="text"
                            value={section.title || ''}
                            onChange={(e) => updateSection(activeSection, { title: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Ex: Clinique, Paraclinique..."
                          />
                        </div>
                      )}
                      {section.type === 'image' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, section.id)}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {section.imageData && (
                              <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                                <img 
                                  src={section.imageData} 
                                  alt="Preview" 
                                  className="max-w-full h-auto border rounded-lg" 
                                  style={{ maxHeight: '200px' }} 
                                />
                              </div>
                            )}
                          </div>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                              <label className="block text-sm font-medium mb-1 text-gray-700">Largeur de l'image</label>
                              <input
                                  type="text"
                                  value={section.width || '100%'}
                                  onChange={(e) => updateSection(section.id, { width: e.target.value })}
                                  className="w-full p-2 border border-gray-300 rounded-lg"
                                  placeholder="Ex: 100%, 300px"
                              />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Alignement</label>
                                <select
                                    value={section.alignment || 'center'}
                                    onChange={(e) => updateSection(section.id, { alignment: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="left">Gauche</option>
                                    <option value="center">Centre</option>
                                    <option value="right">Droite</option>
                                </select>
                            </div>
                          </div>
                          {/* Styling options can be added here if needed for images too */}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Contenu</label>
                          <ReactQuill
                            key={activeSection}
                            theme="snow"
                            value={section.content || ''}
                            onChange={(content, delta, source, editor) => {
                              updateSection(activeSection, {
                                content,
                                contentDelta: editor.getContents(),
                              });
                            }}
                            modules={quillModules}
                            className="bg-white rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                      {section.type === 'expandable' && (
                        <div className="space-y-4 pt-4 border-t mt-4">
                           <h4 className="text-md font-semibold text-gray-600">Options de Style</h4>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Couleur de fond (contenu)</label>
                            <div className="flex flex-wrap gap-2">
                              {themeColors.map(color => (
                                <button
                                  key={color.value}
                                  onClick={() => updateSection(section.id, { backgroundColor: color.value })}
                                  className={`w-7 h-7 rounded-full border-2 ${ section.backgroundColor === color.value ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300' }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.label}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Couleur de surbrillance (titre)</label>
                            <div className="flex flex-wrap gap-2">
                              {themeColors.map(color => (
                                <button
                                  key={color.highlight}
                                  onClick={() => updateSection(section.id, { highlightColor: color.highlight })}
                                  className={`w-7 h-7 rounded-full border-2 ${ section.highlightColor === color.highlight ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300' }`}
                                  style={{ backgroundColor: color.highlight }}
                                  title={color.label}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">Couleur du texte du titre</label>
                            <div className="flex flex-wrap gap-2">
                              {textColors.map(color => (
                                <button
                                  key={color.value}
                                  onClick={() => updateSection(section.id, { titleTextColor: color.value })}
                                  className={`w-7 h-7 rounded-full border-2 ${ section.titleTextColor === color.value ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300' }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.label}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center h-[400px] lg:h-full">
                <Type className="w-24 h-24 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center max-w-xs">
                  Sélectionnez une section à modifier <br /> ou créez-en une nouvelle.
                </p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default ContentEditor;