import React, { ChangeEventHandler, useState } from "react";
import styled from "@emotion/styled";
import { Global, css, keyframes } from "@emotion/react";
import { Clock } from "./Clock";
import { teal } from "./colors";

// state: time / isCountingDown

const MAX_TIME = 20;

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
  background: ${teal};
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
  const [isPaused, setIsPaused] = useState(true);

  const togglePaused = () => setIsPaused((p) => !p);
  const onInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTime(parseFloat(e.target.value));
    setIsPaused(true);
  };

  return (
    <Background>
      <Global styles={globalStyles} />
      <Header />
      <Content>
        <input
          type="number"
          value={time}
          onChange={onInput}
          max={MAX_TIME}
          min={0}
        />
        <Clock maxTime={MAX_TIME} time={time} isPaused={isPaused} />
        <div>
          <button onClick={togglePaused}>{isPaused ? "Start" : "Stop"}</button>
        </div>
      </Content>
      <Footer />
    </Background>
  );
}

export default App;
