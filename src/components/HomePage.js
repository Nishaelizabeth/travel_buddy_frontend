import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ShuffleHero } from './ui/shuffle-grid.jsx';
import InfiniteGallery from './ui/3d-gallery-photography.jsx';
import { AnimatedTestimonials } from './ui/animated-testimonials.jsx';
import home1 from '../Assets/home1.jpg';
import home2 from '../Assets/home2.jpg';
import home3 from '../Assets/home3.jpg';
import home4 from '../Assets/home4.jpeg';
import home5 from '../Assets/home5.jpeg';
import axiosInstance from '../utils/axiosConfig';
import { FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';
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
      <ShuffleHero />

      {/* Testimonials Section */}
      <section style={{ backgroundColor: '#f9fafb', padding: '2rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 className="fancy-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>What Our Travelers Say</h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Real experiences from our travel buddy community</p>
        </div>
        <AnimatedTestimonials
          testimonials={[
            {
              quote: "Found my perfect travel buddy for my Bali trip! The matching system is spot-on. We had an amazing time exploring the beaches and temples together.",
              name: "Sarah Johnson",
              designation: "Adventure Traveler",
              src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop",
            },
            {
              quote: "The platform made it so easy to plan my European adventure with like-minded travelers. I met three amazing companions and we're already planning our next trip!",
              name: "Mike Chen",
              designation: "Solo Explorer",
              src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
            },
            {
              quote: "Best travel companion finder I've ever used. The compatibility matching is incredible - it felt like we'd known each other for years from day one.",
              name: "Emma Davis",
              designation: "Cultural Enthusiast",
              src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop",
            },
            {
              quote: "Great experience using Travel Buddy for my Southeast Asia trip. Found two awesome travel companions who shared my interest in photography and local cuisine.",
              name: "James Wilson",
              designation: "Photography Lover",
              src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop",
            },
            {
              quote: "As a solo female traveler, safety was my priority. Travel Buddy's verification system gave me peace of mind. Made lifelong friends on my trip to Japan!",
              name: "Lisa Thompson",
              designation: "Solo Female Traveler",
              src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
            },
          ]}
          autoplay={true}
        />
      </section>
      {/* 3D Gallery Section */}
      <section className="gallery-section" style={{ position: 'relative', height: '600px', width: '100%' }}>
        <InfiniteGallery
          images={[
            { src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&auto=format&fit=crop', alt: 'Beach sunset' },
            { src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop', alt: 'Mountain lake' },
            { src: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format&fit=crop', alt: 'Travel adventure' },
            { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop', alt: 'Nature landscape' },
            { src: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&auto=format&fit=crop', alt: 'City skyline' },
            { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop', alt: 'Tropical beach' },
            { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop', alt: 'Mountain view' },
            { src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&auto=format&fit=crop', alt: 'Forest path' },
          ]}
          speed={1.2}
          visibleCount={12}
          className="h-full w-full"
        />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '12px', color: '#1f2937' }}>
          <h1 style={{ fontFamily: 'serif', fontSize: '4rem', letterSpacing: '-0.02em', textShadow: '2px 2px 4px rgba(255,255,255,0.5)' }}>
            <span style={{ fontStyle: 'italic' }}>Explore</span>
          </h1>
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