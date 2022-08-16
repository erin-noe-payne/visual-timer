import React, {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

type TimerState = "running" | "paused";

const ringTone = new Audio(
  "https://www.freesoundslibrary.com/wp-content/uploads/2022/03/loud-alarm-clock.mp3#t=12"
);
const ring = () => {
  ringTone.currentTime = 12;
  ringTone.play();
};

function App() {
  const [state, setState] = useState<TimerState>("running");
  const [msRemaining, setMsRemaining] = useState(0);

  const secondsRemaining = Math.round(msRemaining / 1000);

  // clock tick effect
  useEffect(() => {
    if (state === "paused") {
      return;
    }
    if (msRemaining <= 0) {
      setMsRemaining(0);
      setState("paused");
      return;
    }
    const startTime = Date.now();

    const timeout = setTimeout(() => {
      ring();
      setState("paused");
    }, msRemaining);

    return () => {
      const timeElapsed = Date.now() - startTime;
      setMsRemaining((t) => Math.max(t - timeElapsed, 0));
      clearTimeout(timeout);
    };
  }, [state, msRemaining]);

  // set page title effect
  // useEffect(() => {
  //   if (state === "running") {
  //     const MM = Math.floor(secondsRemaining / 60);
  //     const SS = secondsRemaining - MM * 60;
  //     document.title = `${MM}:${SS < 10 ? `0${SS}` : SS} remaining`;
  //   } else {
  //     // TODO, a times up!
  //     document.title = "Visual Timer";
  //   }
  // }, [secondsRemaining, state]);

  // ring & pause when timer hits 0 effect
  // useEffect(() => {
  //   if (secondsRemaining <= 0 && state === "running") {
  //     setState("paused");
  //     ring();
  //   }
  // }, [state, secondsRemaining]);

  // TODO ^ wire up above state to the UI, add pause / play button, input box

  // const [time, setTime] = useState(0);
  // const [isPaused, setIsPaused] = useState(true);

  const onInput = useCallback<ChangeEventHandler<HTMLInputElement>>((e) => {
    setMsRemaining(parseFloat(e.target.value) * 1000);
    setState("paused");
  }, []);
  const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>((e) => {
    e.preventDefault();
    setState((s) => (s === "running" ? "paused" : "running"));
  }, []);

  return (
    <Background>
      <Global styles={globalStyles} />
      <Header />
      <form onSubmit={onSubmit}>
        <Content>
          <input
            type="number"
            value={secondsRemaining}
            onChange={onInput}
            max={MAX_TIME}
            min={0}
          />
          <Clock
            maxTime={MAX_TIME * 1000}
            msRemaining={msRemaining}
            state={state}
          />
          <div>
            <button>{state === "running" ? "Pause" : "Start"}</button>
          </div>
        </Content>
      </form>
      <Footer />
    </Background>
  );
}

export default App;
