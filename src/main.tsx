import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Set branding and metadata dynamically since static files are protected
document.title = "ARIF BINGO";

const metaTags = [
  { property: "og:title", content: "ARIF BINGO" },
  { property: "og:url", content: "https://arif-bingo.mydala.app" },
  { property: "twitter:title", content: "ARIF BINGO" },
  { property: "twitter:url", content: "https://arif-bingo.mydala.app" },
];

metaTags.forEach(tag => {
  let element = document.querySelector(`meta[property="${tag.property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', tag.property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', tag.content);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);