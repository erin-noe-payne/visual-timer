import React, { useState } from "react";
import styled from "@emotion/styled";
import { Global, css, keyframes } from "@emotion/react";

const colors = {
  teal: "rgb(143, 215, 190)",
  blue: "rgb(11, 88, 152)",
  green: "rgb(69, 124, 79)",
  yellow2: "rgb(233, 208, 60)",
  yellow1: "rgb(249, 212, 64)",
  orange2: "rgb(252, 155, 47)",
  orange1: "rgb(246, 108, 50)",
  red2: "rgb(236, 62, 50)",
  red1: "rgb(177, 6, 31)",
};

const MAX_TIME = 30;

const globalStyles = css`
  html,
  body {
    margin: 0;
    padding: 0;
  }
`;

const PHI = 1.618;

const PADDING = 50 / (1 + PHI);

const Background = styled.div`
  background: ${colors.teal};
  box-shadow: 0 0 200px rgba(0, 0, 0, 0.4) inset;

  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: ${PADDING}vmin;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const R = 35;

const ClockFace = styled.div`
  width: ${R * 2}vmin;
  height: ${R * 2}vmin;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
`;

const ringTone = new Audio(
  "https://www.freesoundslibrary.com/wp-content/uploads/2022/03/loud-alarm-clock.mp3#t=12"
);
const ring = () => {
  ringTone.currentTime = 12;
  ringTone.play();
};

const AnimatedTimer: React.FC<{ time: number }> = ({ time }) => {
  const angle = (360 * time) / MAX_TIME;

  const countDown = keyframes`
    from {
      transform: rotate(${angle}deg)
    }

    to {
      transform: rotate(0deg)
    }
    `;

  const Hand = styled.div`
    width: 1px;
    height: 100px;
    background: black;
    animation: ${countDown} ${time}s linear;
  `;

  return <Hand onAnimationEnd={() => ring()} />;
};

const Header = styled.div`
  background: pink;
  display: flex;
  align-items: flex-start;
  flex: 1 1 0;
`;

const Footer = styled.div`
  background: pink;
  display: flex;
  flex: ${PHI} ${PHI} 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function App() {
  const [time, setTime] = useState(0);

  return (
    <Background>
      <Global styles={globalStyles} />
      <Header />
      <Content>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(parseInt(e.target.value))}
        />
        <ClockFace />
        <div>start stop pause</div>
      </Content>
      <Footer />
    </Background>
  );
}

export default App;
