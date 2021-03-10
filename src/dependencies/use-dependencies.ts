import {useEffect, useState} from "react";
import {initDependencies} from "./service-locator";

const useDependencies = (): boolean => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return;
    const init = async () => {
      await initDependencies();
      setReady(true);
    };
    init().then();
  }, []);
  return ready;
};

export default useDependencies;