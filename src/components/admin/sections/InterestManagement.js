import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEye, FiEdit, FiTrash2, FiPlus, FiImage, FiX, FiCheck } from 'react-icons/fi';

const InterestManagement = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/admin/interests/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Process the interests to add proper image URLs
      const processedInterests = response.data.map(interest => ({
        ...interest,
        image_url: interest.image ? `https://travel-buddy-backend-0jf1.onrender.com${interest.image}` : null
      }));
      
      setInterests(processedInterests);
    } catch (error) {
      console.error('Error fetching interests:', error);
      toast.error('Failed to load travel interests');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (interest) => {
    setSelectedInterest(interest);
    setEditMode(false);
    setFormData({
      name: interest.name,
      description: interest.description || '',
      image: null
    });
    setImagePreview(interest.image_url);
    setShowModal(true);
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/interests/${selectedInterest.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Travel interest deleted successfully');
      setShowDeleteConfirm(false);
      setShowModal(false);
      fetchInterests();
    } catch (error) {
      console.error('Error deleting interest:', error);
      toast.error('Failed to delete travel interest');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (files[0]) {
        setFormData({
          ...formData,
          [name]: files[0]
        });
        setImagePreview(URL.createObjectURL(files[0]));
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedInterest) {
        // Update existing interest
        const updateResponse = await axios.put(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/interests/${selectedInterest.id}/`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // If we're in edit mode, turn it off after successful update
        if (editMode) {
          setEditMode(false);
        }
        
        // Update the selected interest with new data
        setSelectedInterest({
          ...selectedInterest,
          ...formData,
          image: imagePreview
        });
        
        toast.success('Travel interest updated successfully');
      } else {
        // Create new interest
        await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/admin/interests/', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Travel interest created successfully');
      }
      setShowModal(false);
      setSelectedInterest(null);
      setFormData({
        name: '',
        description: '',
        image: null
      });
      setImagePreview(null);
      fetchInterests();
    } catch (error) {
      console.error('Error saving interest:', error);
      toast.error(error.response?.data?.message || 'Failed to save travel interest');
    }
  };

  return (
    <div className="interest-management">
      <div className="section-header">
        <h2>Travel Interests Management</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setSelectedInterest(null);
            setFormData({
              name: '',
              description: '',
              image: null
            });
            setImagePreview(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add New Interest
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading travel interests...</div>
      ) : (
        <div className="table-container">
          <table className="data-table destination-table">
            <thead>
              <tr>
                <th>Travel Interest</th>
              </tr>
            </thead>
            <tbody>
              {interests.map(interest => (
                <tr key={interest.id}>
                  <td className="destination-info">
                    {interest.image_url ? (
                      <img src={interest.image_url} alt={interest.name} className="destination-thumbnail" />
                    ) : (
                      <div className="no-image"><FiImage /></div>
                    )}
                    <span className="destination-name">{interest.name}</span>
                    <div className="action-buttons">
                      <button className="btn btn-rectangle btn-view" onClick={() => handleView(interest)}>
                        <FiEye /> View
                      </button>
                      <button className="btn btn-rectangle btn-edit" onClick={() => {
                        handleView(interest);
                        setEditMode(true);
                      }}>
                        <FiEdit /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setEditMode(false); // Reset edit mode when closing modal
        }}>
          <div className="modal destination-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {selectedInterest 
                  ? (editMode ? 'Edit Travel Interest' : 'Travel Interest Details') 
                  : 'Add New Travel Interest'
                }
              </h3>
              <button className="modal-close-btn" onClick={() => {
                setShowModal(false);
                setEditMode(false); // Reset edit mode when closing modal
              }}>
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="form-container" onSubmit={handleSubmit}>
                <div className="destination-modal-content">
                  <div className="destination-image-container">
                    {imagePreview ? (
                      <div className="destination-image">
                        <img src={imagePreview} alt={formData.name} />
                        {(!selectedInterest || editMode) && (
                          <button 
                            type="button" 
                            className="change-image-btn"
                            onClick={() => document.getElementById('image').click()}
                          >
                            <FiImage /> Change Image
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="upload-placeholder" onClick={() => document.getElementById('image').click()}>
                        <FiImage size={40} />
                        <p>Click to upload an image</p>
                        <span>JPG, PNG or GIF, Max 5MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      className="file-input"
                      disabled={selectedInterest && !editMode}
                    />
                  </div>
                  
                  <div className="destination-details">
                    <div className="form-group">
                      <label htmlFor="name">Interest Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter interest name"
                        required
                        readOnly={selectedInterest && !editMode}
                        className={(selectedInterest && !editMode) ? 'readonly-field' : ''}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Provide a detailed description of this interest"
                        required
                        readOnly={selectedInterest && !editMode}
                        className={(selectedInterest && !editMode) ? 'readonly-field' : ''}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  {selectedInterest ? (
                    editMode ? (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          onClick={() => {
                            // Reset form data to original values when canceling edit
                            setFormData({
                              name: selectedInterest.name,
                              description: selectedInterest.description || '',
                              image: null
                            });
                            setImagePreview(selectedInterest.image_url);
                            setEditMode(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-danger" 
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <FiTrash2 /> Delete Interest
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          onClick={() => setShowModal(false)}
                        >
                          Close
                        </button>
                      </>
                    )
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        Create Interest
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal delete-confirm-modal">
            <div className="modal-header">
              <h3><FiTrash2 /> Confirm Deletion</h3>
              <button className="modal-close-btn" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedInterest?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestManagement;
