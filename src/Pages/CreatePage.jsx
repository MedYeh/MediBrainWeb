import React from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../Utils/apiClient';
import ContentEditorUI from '../Components/ContentEditorUI';

// This is the default empty state for the editor when creating a new page.
const defaultContent = {
  title: '',
  description: '',
  category: '',
  tags: [],
  sections: [],
};

const CreatePage = () => {
    const navigate = useNavigate();

    /**
     * This function is passed to the ContentEditorUI component as the `onSave` prop.
     * It receives the complete `content` state from the editor and handles the API call.
     * @param {object} content - The state object from the ContentEditorUI.
     */
    const handleCreate = async (content) => {
        try {
            const formData = new FormData();
            
            // 1. Append main page data to the form
            formData.append('title', content.title);
            formData.append('description', content.description);
            formData.append('category', content.category);
            formData.append('tags', JSON.stringify(content.tags || []));

            // 2. Map sections to the format expected by the backend
            const sectionsMeta = content.sections.map(section => ({
                frontendId: section.id, // The editor uses 'id', which we map to 'frontendId'
                type: section.type,
                title: section.title || '',
                contentDelta: section.type !== 'image' ? section.contentDelta : null,
                parentId: section.parentId,
                order: section.order,
                // Include all styling properties
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

            // 3. Append the sections metadata as a single JSON string
            formData.append('sections', JSON.stringify(sectionsMeta));

            // 4. Filter for sections that have a new file to upload and append them
            content.sections
                .filter(section => section.type === 'image' && section.file)
                .forEach(section => {
                    // The backend expects the file field to be named "image_<frontendId>"
                    formData.append(`image_${section.id}`, section.file, section.file.name);
                });
            
            // 5. Make the POST request to create the page
            await apiClient('/api/pages', {
                method: 'POST',
                body: formData,
            });

            alert('Page créée avec succès !');
            navigate('/pages'); // Redirect to the list of pages after successful creation

        } catch (error) {
            console.error('Erreur lors de la création de la page:', error);
            // Provide a more detailed error message if available from the server
            const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
            alert(`La création a échoué : ${errorMessage}`);
            
            // Re-throwing the error is important. It signals to the child ContentEditorUI
            // that the save operation failed, allowing it to set its `saving` state back to false.
            throw error; 
        }
    };

    // Render the reusable UI component.
    // Pass it the empty initial state, the creation logic, and the button text.
    return (
        <ContentEditorUI 
            initialContent={defaultContent}
            onSave={handleCreate} 
            saveButtonText="Sauvegarder la Nouvelle Page" 
        />
    );
};

export default CreatePage;