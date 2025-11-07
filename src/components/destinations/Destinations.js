import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Destinations.scss';
import { FaMapMarkerAlt, FaArrowRight, FaGlobeAmericas, FaPlane } from 'react-icons/fa';
import { MdTravelExplore, MdLocationOn, MdOutlineExplore } from 'react-icons/md';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {

        const response = await axios.get('https://travel-buddy-backend-0jf1.onrender.com/api/destinations/');

        setDestinations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch destinations');
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  if (loading) return <div className="loading">Loading amazing destinations...</div>;
  if (error) return <div className="error"><FaPlane style={{ fontSize: '2rem', marginBottom: '1rem' }} /> {error}</div>;

  return (
    <div className="destinations-page">
      <h1><MdTravelExplore /> Explore Amazing Destinations</h1>
      <div className="destinations-grid">
        {destinations.map((destination) => (
          <div key={destination.id} className="destination-card">
            <div className="destination-image">
              <img 
                src={destination.image} 
                alt={destination.name}
                onError={(e) => {
                  e.target.src = '/default-destination.jpg';
                }}
              />
            </div>
            <div className="destination-info">
              <h2>{destination.name}</h2>
              <p><FaMapMarkerAlt /> {destination.location}</p>
              <Link 
                to={`/destinations/${destination.id}`} 
                className="view-button"
              >
                Explore Destination <FaArrowRight />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
