import React from "react";
import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const SkeletonWrapper = styled.div`
  display: inline-block;
  height: ${(props) => props.height || "1rem"};
  width: ${(props) => props.width || "100%"};
  background-color: #e2e8f0;
  border-radius: 0.25rem;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

export const Skeleton = ({ height, width, ...props }) => {
  return <SkeletonWrapper height={height} width={width} {...props} />;
};
