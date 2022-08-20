import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";
import {
  ChangeEventHandler,
  FormEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  background: white;
  /* box-shadow: 0 0 200px rgba(0, 0, 0, 0.4) inset; */

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

// in order for sound to work on mobile, audio element must be initialized in response to user interaction
// https://stackoverflow.com/questions/46345883/why-audio-not-playing-on-mobile-browser
// https://pupunzi.open-lab.com/2013/03/13/making-html5-audio-actually-work-on-mobile/
let ringTone: HTMLAudioElement | null = null;
const initRingTone = () => {
  if (ringTone == null) {
    ringTone = new Audio(
      "https://www.freesoundslibrary.com/wp-content/uploads/2022/03/loud-alarm-clock.mp3#t=12"
    );
  }
};
const ring = () => {
  if (ringTone == null) {
    return;
  }
  ringTone.currentTime = 12;
  ringTone.play();
};

function App() {
  const [state, setState] = useState<TimerState>("running");
  const [msRemaining, setMsRemaining] = useState(0);

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
  // const secondsRemaining = Math.round(msRemaining / 1000);
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

  const onClockDrag = useCallback((msRemaining: number) => {
    setMsRemaining(msRemaining);
    setState("paused");
  }, []);
  const onClockRelease = useCallback(() => {
    initRingTone();
    setState("running");
  }, []);

  return (
    <Background>
      <Global styles={globalStyles} />
      <Header />
      <Content>
        <Clock
          maxTime={MAX_TIME * 1000 * 60}
          msRemaining={msRemaining}
          state={state}
          onDrag={onClockDrag}
          onRelease={onClockRelease}
        />
      </Content>
      <Footer />
    </Background>
  );
}

export default App;
