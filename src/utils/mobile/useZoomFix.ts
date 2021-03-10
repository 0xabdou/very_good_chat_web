import {useEffect, useState} from "react";

const useZoomFix = (): string => {
  const zoomDisabled = 'width=device-width,minimum-scale=1.0,maximum-scale=1.0,initial-scale=1.0';
  const zoomEnabled = 'width=device-width,minimum-scale=1.0,maximum-scale=10.0';

  const [viewport, setViewport] = useState('width=device-width, initial-scale=1');
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (navigator.userAgent.match(/iPhone/i) || true) {
      window.addEventListener('gesturestart', function () {
        if (timer) clearTimeout(timer);
        setViewport(zoomEnabled);
      }, false);
      window.addEventListener('touchend', function () {
        if (timer) clearTimeout(timer);
        const newTimer = setTimeout(function () {
          setViewport(zoomDisabled);
        }, 1000);
        setTimer(newTimer);
      }, false);
    }
  }, []);

  return viewport;
};

export default useZoomFix;
