import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import bgVideo from '../Assets/bg.mp4';
import homeVideo from '../Assets/homevideo.mp4';
import home1 from '../Assets/home1.jpg';
import home2 from '../Assets/home2.jpg';
import home3 from '../Assets/home3.jpg';
import home4 from '../Assets/home4.jpeg';
import home5 from '../Assets/home5.jpeg';
import axiosInstance from '../utils/axiosConfig';
import { FaStar, FaRegStar, FaQuoteLeft, FaMapMarkerAlt, FaCompass, FaPlane } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import './HomePage.scss';

// Import Google Font
const GoogleFontLink = () => {
  return (
    <link 
      href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" 
      rel="stylesheet"
    />
  );
};

const HomePage = () => {
  // Add Google Font to document head
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const [latestReviews, setLatestReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch latest reviews from the API
  useEffect(() => {
    const fetchLatestReviews = async () => {
      try {
        const response = await axiosInstance.get('/latest-reviews/');
        setLatestReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching latest reviews:', error);
        setLoading(false);
      }
    };
    
    fetchLatestReviews();
  }, []);
  
  // Fallback testimonials if no reviews are available
  const fallbackTestimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      review: "Found my perfect travel buddy for my Bali trip! The matching system is spot-on. We had an amazing time exploring the beaches and temples together.",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Mike Chen",
      rating: 5,
      review: "The platform made it so easy to plan my European adventure with like-minded travelers. I met three amazing companions and we're already planning our next trip!",
      image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
      id: 3,
      name: "Emma Davis",
      rating: 5,
      review: "Best travel companion finder I've ever used. Highly recommended! The compatibility matching is incredible - it felt like we'd known each other for years.",
      image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      id: 4,
      name: "James Wilson",
      rating: 4,
      review: "Great experience using Travel Buddy for my Southeast Asia trip. Found two awesome travel companions who shared my interest in photography and local cuisine.",
      image: "https://randomuser.me/api/portraits/men/3.jpg"
    }
  ];
  
  // Use latest reviews if available, otherwise use fallback testimonials
  const testimonials = latestReviews.length > 0 ? latestReviews : fallbackTestimonials;

  const featuredTrips = [
    {
      id: 1,
      destination: "Bali, Indonesia",
      dates: "March 15-30, 2024",
      image: "https://source.unsplash.com/800x600/?bali",
      compatibility: 95
    },
    {
      id: 2,
      destination: "Paris, France",
      dates: "April 1-15, 2024",
      image: "https://source.unsplash.com/800x600/?paris",
      compatibility: 88
    },
    {
      id: 3,
      destination: "Tokyo, Japan",
      dates: "May 10-25, 2024",
      image: "https://source.unsplash.com/800x600/?tokyo",
      compatibility: 92
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <video autoPlay muted loop className="hero-video">
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content">
          <h1>Find Your Perfect Travel Buddy & Plan Your Next Adventure!</h1>
          <p>Join a community of travelers, create or join trips, and meet like-minded companions effortlessly.</p>
          <div className="hero-buttons">
            <Link to="/register" className="primary-button">Sign Up Now</Link>
            <Link to="/destinations" className="secondary-button">Explore Destinations</Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="fancy-title">How It Works</h2>
          <p>Your journey to finding the perfect travel companion is just a few steps away</p>
        </div>
        <div className="steps-container row-layout">
          <div className="step">
            <div className="step-icon">
              <FaCompass />
              <span>1</span>
            </div>
            <h3>Sign Up & Set Preferences</h3>
            <p>Create your profile and tell us about your travel style, interests, and preferences</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <FaPlane />
              <span>2</span>
            </div>
            <h3>Create or Join Trips</h3>
            <p>Browse existing adventures or create your own dream journey to share with others</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <FaMapMarkerAlt />
              <span>3</span>
            </div>
            <h3>Match with Buddies</h3>
            <p>Connect with travelers who share your interests and travel style</p>
          </div>
          <div className="step">
            <div className="step-icon">
              <span>4</span>
            </div>
            <h3>Chat & Travel Together</h3>
            <p>Plan your adventure together and create memories that last a lifetime</p>
          </div>
        </div>
      </section>

      {/* Why Travel with Us Section */}
      <section className="why-choose-us-section">
        <div className="section-content">
          <div className="text-content">
            <h2 className="fancy-title">Why Travel with Us?</h2>
            <div className="features-container">
              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <h3>Verified Travel Buddies</h3>
                  <p>Connect with real, like-minded travelers who have been verified for your safety</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">❤️</div>
                <div>
                  <h3>Smart Compatibility Matching</h3>
                  <p>Our intelligent matching system connects you with travelers who share your interests</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <div>
                  <h3>Easy Trip Management</h3>
                  <p>Create, manage, and join trips with our intuitive and user-friendly platform</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">💬</div>
                <div>
                  <h3>Seamless Communication</h3>
                  <p>Stay connected with your travel buddies through our built-in messaging system</p>
                </div>
              </div>
            </div>
          </div>
          <div className="image-gallery">
            <div className="gallery-image main-image">
              <img src={home1} alt="Travelers enjoying their journey" />
            </div>
            <div className="gallery-image">
              <img src={home2} alt="Travel buddies exploring together" />
            </div>
            <div className="gallery-image">
              <img src={home3} alt="Beautiful destination" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Destination Showcase */}
      <section className="destination-showcase">
        <div className="section-header">
          <h2 className="fancy-title">Discover Amazing Destinations</h2>
        </div>
        <div className="destination-grid">
          <div className="destination-card large">
            <img src={home4} alt="Beautiful destination" />
            <div className="destination-info">
              <h3>Tropical Paradise</h3>
              <p>Experience breathtaking beaches and lush landscapes</p>
            </div>
          </div>
          <div className="destination-card">
            <img src={home5} alt="Urban adventure" />
            <div className="destination-info">
              <h3>Urban Exploration</h3>
              <p>Discover vibrant city life and cultural hotspots</p>
            </div>
          </div>
          <div className="destination-card">
            <img src={home3} alt="Mountain adventure" />
            <div className="destination-info">
              <h3>Mountain Escape</h3>
              <p>Find serenity in majestic mountain landscapes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trips Section - Removed as requested */}

      {/* Latest Reviews Section */}
      <section className="latest-reviews">
        <h2 className="fancy-title">Latest Trip Reviews</h2>
        {loading ? (
          <div className="loading-reviews">Loading reviews...</div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              768: {
                slidesPerView: 2
              },
              1024: {
                slidesPerView: 3
              }
            }}
            className="reviews-swiper"
          >
            {testimonials.map((review, index) => (
              <SwiperSlide key={review.id || index} className="review-slide">
                <div className="review-card">
                  <div className="review-header">
                    <img 
                      src={review.user_profile_picture || review.image || 'https://via.placeholder.com/50'} 
                      alt={review.user_name || review.name} 
                      className="reviewer-image"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50' }}
                    />
                    <div className="reviewer-info">
                      <h3>{review.user_name || review.name}</h3>
                      <div className="review-trip">
                        {review.trip_name && <span>Trip: {review.trip_name}</span>}
                      </div>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < (review.rating || 5) ? 
                              <FaStar className="star-filled" /> : 
                              <FaRegStar className="star-empty" />}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="review-content">
                    <FaQuoteLeft className="quote-icon" />
                    <p>{review.comment || review.review}</p>
                  </div>
                  {review.formatted_date && (
                    <div className="review-date">
                      {review.formatted_date}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      {/* Final CTA Section removed as requested */}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-video-container">
          <video autoPlay muted loop className="footer-video">
            <source src={homeVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="footer-overlay"></div>
        </div>
        <div className="footer-content">
          <div className="footer-logo-section">
            <h2>Travel Buddy</h2>
            <p>Find your perfect travel companion and create unforgettable memories together.</p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Travel Buddy System. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;