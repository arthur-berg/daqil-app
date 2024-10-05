"use client";

import { useEffect } from "react";

const TidioChat = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//code.tidio.co/yktkainububxrzj0222vzob18lqkmzvt.js";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup function to remove script if component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // No need to return a visual element, as the Tidio chat is an external widget
};

export default TidioChat;
