import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentPage.scss';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get plan details from location state
  const planDetails = location.state?.plan;
  const returnPath = location.state?.returnPath || '/';
  const tripDetails = location.state?.tripDetails;
  
  useEffect(() => {
    // Redirect if no plan was selected
    if (!planDetails) {
      navigate('/');
    }
  }, [planDetails, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      alert(`Payment successful! You are now subscribed to the ${planDetails === 'gold' ? 'Gold' : 'Silver'} plan.`);
      
      // Navigate back to the return path with trip details if available
      if (tripDetails) {
        navigate(returnPath, { state: { tripDetails } });
      } else {
        navigate(returnPath);
      }
    } catch (err) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // Navigate back to the return path with trip details if available
    if (tripDetails) {
      navigate(returnPath, { state: { tripDetails } });
    } else {
      navigate(returnPath);
    }
  };
  
  if (!planDetails) {
    return <div className="loading">Redirecting...</div>;
  }
  
  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Payment</h1>
        
        <div className="plan-summary">
          <h2>Order Summary</h2>
          <div className="plan-details">
            <div className="plan-name">{planDetails === 'gold' ? 'Gold Plan' : 'Silver Plan'}</div>
            <div className="plan-price">
              {planDetails === 'gold' ? '₹2999/year' : '₹299/month'}
            </div>
          </div>
          <div className="plan-features">
            {planDetails === 'gold' ? (
              <ul>
                <li>All Silver features</li>
                <li>Ad-free experience</li>
                <li>Early access to new features</li>
                <li>Exclusive travel deals</li>
              </ul>
            ) : (
              <ul>
                <li>View unlimited compatible trips</li>
                <li>Advanced trip matching</li>
                <li>Priority customer support</li>
              </ul>
            )}
          </div>
        </div>
        
        <div className="payment-methods">
          <h2>Payment Method</h2>
          <div className="payment-method-tabs">
            <button 
              className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodChange('card')}
            >
              Credit/Debit Card
            </button>
            <button 
              className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => handlePaymentMethodChange('upi')}
            >
              UPI
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {paymentMethod === 'card' ? (
              <div className="card-form">
                <div className="form-group">
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    placeholder="1234 5678 9012 3456" 
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input 
                    type="text" 
                    name="cardName" 
                    placeholder="John Doe" 
                    value={formData.cardName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label>Expiry Date</label>
                    <input 
                      type="text" 
                      name="expiryDate" 
                      placeholder="MM/YY" 
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label>CVV</label>
                    <input 
                      type="text" 
                      name="cvv" 
                      placeholder="123" 
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="upi-form">
                <div className="form-group">
                  <label>UPI ID</label>
                  <input 
                    type="text" 
                    name="upiId" 
                    placeholder="yourname@upi" 
                    value={formData.upiId}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="pay-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay ${planDetails === 'gold' ? '₹2999' : '₹299'}`}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;