import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import './ChatWindow.scss';

const ChatWindow = ({ tripId, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Define scrollToBottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Format timestamp for display
  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Fetch messages from the server
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/trip/${tripId}/chat/`);
      setMessages(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoading(false);
    }
  }, [tripId]);

  // Connect to WebSocket
  useEffect(() => {
    if (!isOpen) return;
    
    // Clean up any existing connection
    if (socketRef.current) {
      console.log('Closing existing WebSocket connection');
      socketRef.current.close();
      socketRef.current = null;
    }
    
    // Define alternative URLs outside the function scope so they can be accessed by attemptReconnect
    const token = localStorage.getItem('accessToken');
    
    // Get WebSocket URL from environment variables or use default

    const wsBaseUrl = process.env.REACT_APP_WEBSOCKET_URL || 'wss://travel-buddy-backend-0jf1.onrender.com/ws';

    
    // Build the WebSocket URL - try multiple options with different formats
    // Option 1: Using the environment variable with trailing slash
    let wsUrl = `${wsBaseUrl}/chat/${tripId}/?token=${token}`;
    
    // Try all these different URL formats if the connection fails
    const alternativeUrls = [
      `${wsBaseUrl}/chat/${tripId}?token=${token}`,  // Without trailing slash
      `${wsBaseUrl.replace('localhost', '127.0.0.1')}/chat/${tripId}/?token=${token}`,  // Using IP instead of localhost
      `${wsBaseUrl.replace('localhost', '127.0.0.1')}/chat/${tripId}?token=${token}`   // IP without trailing slash
    ];
    
    // Helper function to set up WebSocket event handlers - moved outside to be accessible to both functions
    const setupSocketEventHandlers = (socket) => {
      socket.onopen = () => {
        console.log('WebSocket connection established');
        setSocketConnected(true);
        setError('');
        reconnectAttemptsRef.current = 0;
        
        // Log successful connection
        console.log('WebSocket connection ready to send and receive messages');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          
          // Update messages state with the new message
          if (data.message) {
            setMessages(prevMessages => [...prevMessages, {
              id: data.message_id,
              sender: {
                id: data.sender_id,
                username: data.sender_username,
                profile_picture: data.sender_profile_picture
              },
              message: data.message,
              timestamp: data.timestamp,
              formatted_timestamp: data.formatted_timestamp
            }]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error occurred:', error);
        setError('Connection error - Please check if the server is running');
        setSocketConnected(false);
      };
      
      socket.onclose = (event) => {
        console.log(`WebSocket connection closed with code: ${event.code}`);
        setSocketConnected(false);
        
        // Provide more specific error messages based on close code
        if (event.code === 1000) {
          // Normal closure
          setError('Chat connection closed normally');
        } else if (event.code === 1006) {
          // Abnormal closure
          setError('Connection error - Please check if the server is running');
          // Attempt to reconnect
          attemptReconnect();
        } else {
          // Other errors
          setError(`Connection closed (Code: ${event.code}). Please try again.`);
          attemptReconnect();
        }
      };
      
      return socket;
    };
    
    // Function to create a new WebSocket connection
    const connectWebSocket = () => {
      // Get token from localStorage for authentication
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      console.log('Primary WebSocket URL:', wsUrl);
      console.log('Alternative URLs available:', alternativeUrls.length);
      console.log('Current time:', new Date().toISOString());
      console.log('Trip ID:', tripId);
      console.log('Token available:', !!token);
      
      // Create the WebSocket and set up event handlers
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      setupSocketEventHandlers(socket);
    };
    
    // Function to attempt reconnection with alternative URLs
    const attemptReconnect = () => {
      if (!isOpen) return; // Don't reconnect if modal is closed
      
      const maxReconnectAttempts = 5;
      reconnectAttemptsRef.current++;
      
      console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
      
      if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
        // Wait a bit before trying to reconnect
        setTimeout(() => {
          // Try alternative URLs on subsequent reconnection attempts
          if (reconnectAttemptsRef.current > 1 && reconnectAttemptsRef.current <= alternativeUrls.length + 1) {
            // Use one of the alternative URLs based on the current attempt number
            const altUrlIndex = reconnectAttemptsRef.current - 2;
            const altUrl = alternativeUrls[altUrlIndex];
            console.log(`Trying alternative URL (${altUrlIndex + 1}/${alternativeUrls.length}):`, altUrl);
            
            // Create a new WebSocket with the alternative URL
            const altSocket = new WebSocket(altUrl);
            socketRef.current = altSocket;
            
            // Set up the same event handlers for the alternative socket
            setupSocketEventHandlers(altSocket);
          } else {
            // Use the primary URL or cycle back to it after trying all alternatives
            connectWebSocket();
          }
        }, 2000);
      } else {
        console.log('Maximum reconnection attempts reached');
        setError('Could not establish connection after multiple attempts');
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket connection on cleanup');
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [tripId, isOpen]);

  // Send message handler
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // If WebSocket is connected, send message through WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          message: newMessage.trim()
        }));
        setNewMessage('');
      } else {
        // Fallback to REST API if WebSocket is not connected
        const response = await axiosInstance.post(`/trip/${tripId}/chat/`, {
          trip: tripId,
          message: newMessage.trim()
        });
        setMessages(prevMessages => [...prevMessages, response.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Fetch messages when component mounts or tripId changes
  useEffect(() => {
    if (isOpen && tripId) {
      fetchMessages();
      // WebSocket connection is handled in a separate useEffect
    }
    
    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [tripId, isOpen, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-window">
        <div className="chat-header">
          <h3>Trip Chat {socketConnected && <span className="connection-status connected">●</span>}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="chat-messages">
          {loading ? (
            <div className="loading">Loading messages...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">No messages yet. Start the conversation!</div>
          ) : (
            messages.map(message => (
              <div key={message.id} className="message">
                <div className="message-header">
                  <img 
                    src={message.sender_profile_picture || '/default-avatar.png'} 
                    alt={message.sender_username} 
                    className="sender-avatar"
                  />
                  <span className="sender-name">{message.sender_username}</span>
                  <span className="timestamp">{formatTime(message.timestamp)}</span>
                </div>
                <div className="message-body">{message.message}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newMessage.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
