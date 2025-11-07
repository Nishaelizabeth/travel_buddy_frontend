import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEye, FiTrash2, FiPlus, FiImage, FiMap, FiX, FiCheck, FiList, FiEdit } from 'react-icons/fi';

const DestinationManagement = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [travelInterests, setTravelInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    highlights: '',
    best_time_to_visit: '',
    image: null,
    activities: []
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchDestinations();
    fetchTravelInterests();
  }, []);

  const fetchTravelInterests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/travel-interests/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTravelInterests(response.data);
    } catch (error) {
      console.error('Error fetching travel interests:', error);
      toast.error('Failed to load travel interests');
    }
  };

  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/admin/destinations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (destination) => {
    setSelectedDestination(destination);
    setEditMode(false);
    
    // Get the destination's current travel interests
    const getDestinationInterests = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/destinations/${destination.id}/interests/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setSelectedInterests(response.data.map(interest => interest.id));
      } catch (error) {
        console.error('Error fetching destination interests:', error);
        // If API endpoint doesn't exist, we'll just use an empty array
        setSelectedInterests([]);
      }
    };
    
    getDestinationInterests();
    
    setFormData({
      name: destination.name,
      description: destination.description || '',
      location: destination.location || '',
      highlights: destination.highlights || '',
      best_time_to_visit: destination.best_time_to_visit || '',
      image: null,
      activities: []
    });
    setImagePreview(destination.image_url);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/destinations/${selectedDestination.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      toast.success('Destination deleted successfully');
      setShowDeleteConfirm(false);
      setShowModal(false);
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
    }
  };

  const handleInterestChange = (interestId) => {
    setSelectedInterests(prevInterests => {
      if (prevInterests.includes(interestId)) {
        return prevInterests.filter(id => id !== interestId);
      } else {
        return [...prevInterests, interestId];
      }
    });
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
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
        if (formData[key] !== null && key !== 'activities') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let destinationId;

      if (selectedDestination) {
        // Update existing destination
        const updateResponse = await axios.put(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/destinations/${selectedDestination.id}/`, formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        destinationId = selectedDestination.id;
        
        // If we're in edit mode, turn it off after successful update
        if (editMode) {
          setEditMode(false);
        }
        
        // Update the selected destination with new data
        setSelectedDestination({
          ...selectedDestination,
          ...formData,
          image_url: imagePreview
        });
        
        toast.success('Destination updated successfully');
        // Refresh the destinations list to show updated data
        fetchDestinations();
      } else {
        // Create new destination
        const response = await axios.post('https://travel-buddy-backend-0jf1.onrender.com/api/admin/destinations/', formDataToSend, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        destinationId = response.data.id;
        toast.success('Destination created successfully');
        // Refresh the destinations list to show the new destination
        fetchDestinations();
      }

      // Update travel interests for the destination
      try {
        await axios.post(`https://travel-buddy-backend-0jf1.onrender.com/api/admin/destinations/${destinationId}/interests/`, {
          interests: selectedInterests
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error updating travel interests:', error);
        // This might fail if the endpoint doesn't exist, but we'll continue anyway
      }

      setShowModal(false);
      setSelectedDestination(null);
      setSelectedInterests([]);
      setFormData({
        name: '',
        description: '',
        location: '',
        highlights: '',
        best_time_to_visit: '',
        image: null,
        activities: []
      });
      setImagePreview(null);
      fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast.error(error.response?.data?.message || 'Failed to save destination');
    }
  };

  return (
    <div className="destination-management">
      <div className="section-header">
        <h2>Destination Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedDestination(null);
            setSelectedInterests([]);
            setFormData({
              name: '',
              description: '',
              location: '',
              highlights: '',
              best_time_to_visit: '',
              image: null,
              activities: []
            });
            setImagePreview(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add New Destination
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading destinations...</div>
      ) : (
        <div className="table-container">
          <table className="data-table destination-table">
            <thead>
              <tr>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map(destination => (
                <tr key={destination.id}>
                  <td className="destination-info">
                    {destination.image_url ? (
                      <img src={destination.image_url} alt={destination.name} className="destination-thumbnail" />
                    ) : (
                      <div className="no-image"><FiImage /></div>
                    )}
                    <span className="destination-name">{destination.name}</span>
                    <div className="action-buttons">
                      <button className="btn btn-rectangle btn-view" onClick={() => handleView(destination)}>
                        <FiEye /> View
                      </button>
                      <button className="btn btn-rectangle btn-edit" onClick={() => {
                        handleView(destination);
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
              {selectedDestination 
                ? (editMode ? 'Edit Destination' : 'Destination Details') 
                : 'Add New Destination'
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
                      {(!selectedDestination || editMode) && (
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
                    disabled={selectedDestination && !editMode}
                  />
                </div>
                
                <div className="destination-details">
                  <div className="form-group">
                    <label htmlFor="name">Destination Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter destination name"
                      required
                      readOnly={selectedDestination && !editMode}
                      className={(selectedDestination && !editMode) ? 'readonly-field' : ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      required
                      readOnly={selectedDestination && !editMode}
                      className={(selectedDestination && !editMode) ? 'readonly-field' : ''}
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
                      placeholder="Provide a detailed description of this destination"
                      required
                      readOnly={selectedDestination && !editMode}
                      className={(selectedDestination && !editMode) ? 'readonly-field' : ''}
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="highlights">Highlights</label>
                    <textarea
                      id="highlights"
                      name="highlights"
                      value={formData.highlights}
                      onChange={handleChange}
                      rows="3"
                      placeholder="List key attractions and highlights"
                      readOnly={selectedDestination && !editMode}
                      className={(selectedDestination && !editMode) ? 'readonly-field' : ''}
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="best_time_to_visit">Best Time to Visit</label>
                    <input
                      type="text"
                      id="best_time_to_visit"
                      name="best_time_to_visit"
                      value={formData.best_time_to_visit}
                      onChange={handleChange}
                      placeholder="e.g. June to September"
                      readOnly={selectedDestination && !editMode}
                      className={(selectedDestination && !editMode) ? 'readonly-field' : ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Assign Travel Interests</label>
                    <div className="travel-interests-selector">
                      {travelInterests.length > 0 ? (
                        <div className="interests-list">
                          {travelInterests.map(interest => (
                            <div 
                              key={interest.id} 
                              className={`interest-item ${selectedInterests.includes(interest.id) ? 'selected' : ''} ${(selectedDestination && !editMode) ? 'disabled' : ''}`}
                              onClick={() => (selectedDestination && !editMode) ? null : handleInterestChange(interest.id)}
                            >
                              <span className="interest-checkbox">
                                {selectedInterests.includes(interest.id) && <FiCheck />}
                              </span>
                              <span className="interest-name">{interest.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-interests">No travel interests available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                {selectedDestination ? (
                  editMode ? (
                    <>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => {
                          // Reset form data to original values when canceling edit
                          setFormData({
                            name: selectedDestination.name,
                            description: selectedDestination.description || '',
                            location: selectedDestination.location || '',
                            highlights: selectedDestination.highlights || '',
                            best_time_to_visit: selectedDestination.best_time_to_visit || '',
                            image: null
                          });
                          setImagePreview(selectedDestination.image_url);
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
                        <FiTrash2 /> Delete Destination
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
                      Create Destination
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
            <p>Are you sure you want to delete <strong>{selectedDestination?.name}</strong>?</p>
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

export default DestinationManagement;
