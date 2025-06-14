import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, Info, Text } from 'lucide-react';
import apiClient from '../Utils/apiClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill'; // Import Quill for Delta-to-HTML conversion

const PageViewer = () => {
  const { id } = useParams(); // Get page ID from URL (e.g., /pages/:id)
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());

  // Initialize Quill instance for Delta-to-HTML conversion
  const quill = new Quill(document.createElement('div'));

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await apiClient(`/api/pages/${id}`, { method: 'GET' });
        setPage(response);
        // Initialize expanded state based on section's isExpanded property
        const expandableIds = [];
        const collectExpandableIds = (sections) => {
          sections.forEach(section => {
            if (section.type === 'expandable' && section.isExpanded) {
              expandableIds.push(section.frontendId);
            }
            if (section.children) {
              collectExpandableIds(section.children);
            }
          });
        };
        collectExpandableIds(response.sections);
        setExpandedSections(new Set(expandableIds));
      } catch (err) {
        setError(err.message || 'Failed to fetch page');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [id]);

  const toggleExpandSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.has(sectionId) ? newSet.delete(sectionId) : newSet.add(sectionId);
      return newSet;
    });
  };

  // Convert Quill Delta to HTML
  const deltaToHtml = (delta) => {
    if (!delta || !delta.ops) return '';
    quill.setContents(delta);
    return quill.root.innerHTML;
  };

  const RenderSection = ({ section, level = 0 }) => {
    const isExpanded = expandedSections.has(section.frontendId);
    const children = section.children || [];

    // Handle image section
    if (section.type === 'image') {
      if (!section.imageData) {
        return <div className="text-gray-500 mb-4">Aucune image sélectionnée</div>;
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
        marginLeft: `${level * 10}px`
      };
      
      return (
        <div style={containerStyle}>
          <img 
            src={section.imageData} 
            alt={section.filename || 'Image'} 
            style={imageStyle}
            onError={(e) => {
              console.error('Image failed to load:', section.imageData?.substring(0, 50));
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="hidden p-4 bg-gray-100 rounded-lg">
            <p className="text-red-500">Erreur de chargement de l'image</p>
            {section.filename && (
              <p className="text-sm text-gray-400">{section.filename}</p>
            )}
          </div>
        </div>
      );
    }

    if (section.type === 'raw_text') {
      const hasContent = section.contentDelta && deltaToHtml(section.contentDelta).trim() !== '' && deltaToHtml(section.contentDelta) !== '<p><br></p>';
      return (
        <div 
          className="ql-snow mb-4" 
          style={{ 
            marginLeft: `${level * 10}px`,
            display: hasContent ? 'block' : 'none'
          }}
        >
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: deltaToHtml(section.contentDelta) }}
            style={{ 
              minHeight: hasContent ? 'auto' : '0px',
              padding: hasContent ? '12px 15px' : '0px'
            }}
          />
        </div>
      );
    }

    if (section.type === 'info_box') {
      const hasContent = section.contentDelta && deltaToHtml(section.contentDelta).trim() !== '' && deltaToHtml(section.contentDelta) !== '<p><br></p>';
      return (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4"
          style={{
            marginLeft: `${level * 10}px`,
            display: hasContent ? 'flex' : 'none',
            padding: hasContent ? '16px' : '0px'
          }}
        >
          <Info className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <div className="ql-snow flex-1">
            <div
              className="ql-editor !p-0"
              dangerouslySetInnerHTML={{ __html: deltaToHtml(section.contentDelta) }}
            />
          </div>
        </div>
      );
    }

    // Default expandable section
    const hasContent = section.contentDelta && deltaToHtml(section.contentDelta).trim() !== '' && deltaToHtml(section.contentDelta) !== '<p><br></p>';

    return (
      <div className="mb-2" style={{ marginLeft: `${level * 10}px` }}>
        <div className="border rounded-lg bg-white overflow-hidden shadow-sm" style={{ border: 'none' }}>
          <div
            className="flex items-center justify-between p-3 cursor-pointer"
            style={{ 
              backgroundColor: section.highlightColor || '#4b5563',
              color: section.titleTextColor || '#ffffff',
              border: `${section.borderWidth || 0}px ${section.borderStyle || 'solid'} ${section.borderColor || '#e0f2fe'}`,
              borderRadius: '0.5rem'
            }}
            onClick={() => toggleExpandSection(section.frontendId)}
          >
            <h3 className="font-semibold">{section.title || 'Section (sans titre)'}</h3>
            <span className="text-sm font-bold">{isExpanded ? '-' : '+'}</span>
          </div>
          {isExpanded && hasContent && (
            <div 
              style={{ 
                backgroundColor: section.backgroundColor || '#f3f4f6',
                marginTop: '2px',
                borderRadius: '0 0 0.5rem 0.5rem'
              }}
            >
              <div className="p-3 text-sm text-gray-700 ql-snow">
                <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{ __html: deltaToHtml(section.contentDelta) }}
                />
              </div>
              {children.length > 0 && (
                <div className="p-3 space-y-2 border-t">
                  {children.map(child => (
                    <RenderSection key={child.frontendId} section={child} level={level + 1} />
                  ))}
                </div>
              )}
            </div>
          )}
          {isExpanded && !hasContent && children.length > 0 && (
            <div 
              style={{ 
                backgroundColor: section.backgroundColor || '#f3f4f6',
                marginTop: '2px',
                borderRadius: '0 0 0.5rem 0.5rem'
              }}
            >
              <div className="p-3 space-y-2">
                {children.map(child => (
                  <RenderSection key={child.frontendId} section={child} level={level + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 text-center">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 text-center">
        <p className="text-lg text-red-600">Erreur : {error}</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 text-center">
        <p className="text-lg text-gray-600">Aucune page trouvée</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{page.title}</h1>
      </div>
      <div className="max-w-sm mx-auto bg-white rounded-lg p-4 shadow-lg">

        <div className="bg-blue-600 text-white p-4 rounded-t-lg mb-4">
          <h2 className="font-bold text-xl">{page.title}</h2>
        </div>
        <div className="space-y-4 p-2">
          {page.description && (
            <p className="text-sm text-gray-700 mb-4">{page.description}</p>
          )}
          {page.sections.map(section => (
            <RenderSection key={section.frontendId} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageViewer;