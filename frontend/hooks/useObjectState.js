import { useState } from "react";

export default function useObjectState(defaultVal) {
  const [_state, _setState] = useState(defaultVal);

  return {
    state: _state,
    setState: (obj) => {
      _setState((oldObj) => {
        return { ...oldObj, ...obj };
      });
    },
  };
}
