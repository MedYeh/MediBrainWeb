import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../Utils/apiClient';
import ContentEditorUI from '../Components/ContentEditorUI';

/**
 * A recursive helper function to convert the nested `sections` array from the database
 * into the flat array structure that the ContentEditorUI component requires.
 * @param {Array} sections - The nested sections array from the API response.
 * @param {number|null} parentId - The frontendId of the parent section.
 * @returns {Array} A flat array of section objects.
 */
const flattenSections = (sections, parentId = null) => {
    let flatList = [];
    if (!sections) return flatList;

    sections.forEach((section) => {
        // Destructure to separate children and the Mongoose _id from the rest of the properties.
        const { children, _id, ...rest } = section;
        
        // --- THIS IS THE FIX ---
        // We now explicitly include `contentDelta` and `imageData` from the original section object.
        const flatSection = {
            ...rest,
            id: section.frontendId,
            parentId: parentId,
            file: null, 
            // The editor's Quill component uses `contentDelta` to load rich text
            contentDelta: section.contentDelta, 
            // The editor's image preview uses `imageData` to show the existing image
            imageData: section.imageData || '', 
        };
        flatList.push(flatSection);

        // If the section has children, recursively flatten them.
        if (children && children.length > 0) {
            const childList = flattenSections(children, section.frontendId);
            flatList = flatList.concat(childList);
        }
    });
    return flatList;
};


const EditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [initialContent, setInitialContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                const pageData = await apiClient(`/api/pages/${id}`);
                
                // Convert the nested data structure to the flat structure for the editor.
                const flattenedSections = flattenSections(pageData.sections);

                setInitialContent({
                    title: pageData.title,
                    description: pageData.description,
                    category: pageData.category,
                    tags: pageData.tags || [],
                    sections: flattenedSections,
                });
                setError(null);
            } catch (err) {
                setError('Failed to load page data. It may not exist or there was a server error.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [id]); // Re-run the effect if the page ID in the URL changes.

    /**
     * This function is passed to the ContentEditorUI as the `onSave` prop.
     * It handles the logic for making a PUT request to update the page.
     * @param {object} content - The current state from the ContentEditorUI.
     */
    const handleUpdate = async (content) => {
        try {
            const formData = new FormData();
            
            formData.append('title', content.title);
            formData.append('description', content.description);
            formData.append('category', content.category);

            const sectionsMeta = content.sections.map(section => ({
                frontendId: section.id,
                // ... include all other properties for the section
                type: section.type,
                title: section.title || '',
                contentDelta: section.contentDelta || null,
                parentId: section.parentId,
                order: section.order,
                backgroundColor: section.backgroundColor,
                highlightColor: section.highlightColor,
                titleTextColor: section.titleTextColor,
                borderWidth: section.borderWidth,
                borderStyle: section.borderStyle,
                borderColor: section.borderColor,
                width: section.width,
                alignment: section.alignment,
                isExpanded: section.isExpanded,
            }));

            formData.append('sections', JSON.stringify(sectionsMeta));

            // IMPORTANT: Only upload files that are new.
            // A section loaded from the DB won't have a `file` object unless the user uploads a new one.
            content.sections
                .filter(section => section.type === 'image' && section.file)
                .forEach(section => {
                    formData.append(`image_${section.id}`, section.file, section.file.name);
                });
            
            await apiClient(`/api/pages/${id}`, {
                method: 'PUT',
                body: formData,
            });

            alert('Page mise à jour avec succès !');
            navigate('/pages');
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la page:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Erreur inconnue';
            alert(`La mise à jour a échoué : ${errorMessage}`);
            throw err; // Re-throw to let the child component know the save failed.
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Chargement de l'éditeur...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    // Render the reusable UI component, passing the fetched data and the update logic.
    return (
        <ContentEditorUI
            initialContent={initialContent}
            onSave={handleUpdate}
            saveButtonText="Mettre à Jour la Page"
        />
    );
};

export default EditPage;