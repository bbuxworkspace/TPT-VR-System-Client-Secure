import React from "react";
import styled from "styled-components";

const IndicatorWrapper = styled.div`
  width: 100%;
  margin: 32px 0;
`;

const IndicatorProgress = styled.div`
  width: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  height: 5px;
  position: relative;

  &:before {
    position: absolute;
    content: "";
    border-radius: 8px;
    /* transition: 0.15s width linear; */
    top: 0;
    left: 0;
    width: ${({ progress }) => progress}%;
    height: 100%;
    background-color: #fff;
    z-index: 4;
  }
`;

const IndicatorContent = styled.div`
  padding: 18px 0;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
`;

const IndicatorText = ({ progress, ...props }) => {

  switch (progress) {
    case progress < 30:
      return <p {...props}>{"Loading your selected room..."}</p>;
    case progress >= 30 && progress < 70:
      return <p {...props}>{"Please wait..."}</p>;
    case 100:
      return <p {...props}>{"Welcome to your room!"}</p>;
    default:
      return <p {...props}>{"Please wait..."}</p>;
  }
};
const IndicatorPercent = styled.span``;

export default function LoadingIndicator({ progress = 0 }) {
  return (
    <IndicatorWrapper className='indicator'>
      <IndicatorProgress progress={progress} className='indicator-progress' />
      <IndicatorContent>
        <IndicatorText progress={progress} className='indicator-text' />
        <IndicatorPercent className='indicator-text'>
          {progress}%
        </IndicatorPercent>
      </IndicatorContent>
    </IndicatorWrapper>
  );
}
