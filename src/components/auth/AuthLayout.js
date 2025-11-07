import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const VideoBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AuthCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.85);  /* Slightly transparent background */
  backdrop-filter: blur(5px);  /* Adds a blur effect to the background */
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  aspect-ratio: 1.5;

  @media (max-width: 768px) {
    padding: 2rem;
    aspect-ratio: 1;
  }
`;

const Title = styled.h2`
  color: #333333;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #666666;
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const AuthLayout = ({ children, backgroundVideo }) => {
  return (
    <>
      {backgroundVideo && (
        <VideoBackground>
          <video autoPlay loop muted playsInline>
            <source src={backgroundVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </VideoBackground>
      )}
      <Container>
        <Content>
          {children}
        </Content>
      </Container>
    </>
  );
};

export { AuthLayout, AuthCard, Title, Subtitle };
