import React, { useState, useEffect } from 'react';

// Counts up in seconds from mount — used inside loading states so the user can
// see that a long-running request is actively working, not stuck.
export default function Elapsed() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="tabular-nums">{seconds}s</span>;
}
