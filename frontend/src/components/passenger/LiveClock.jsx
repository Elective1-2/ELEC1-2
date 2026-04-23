import { useState, useEffect } from 'react';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dmp-clock">
      <div className="dmp-clock-time">{timeStr}</div>
      <div className="dmp-clock-date">{dateStr}</div>
    </div>
  );
}

export default LiveClock;