import {useEffect} from "react";

const _setDimensions = () => {
  const doc = document.documentElement;
  const height = doc.clientHeight;
  const width = doc.clientWidth;
  const vh = height / 100;
  const vw = width / 100;
  doc.style.setProperty('--vh', `${vh}px`);
  doc.style.setProperty('--vw', `${vw}px`);
};


const useDimensionsFix = () => {
  useEffect(() => {
    _setDimensions();
    window.addEventListener('resize', _setDimensions);
  },[]);
};

export default useDimensionsFix;


