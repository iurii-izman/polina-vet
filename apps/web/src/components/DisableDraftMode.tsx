import { useIsPresentationTool } from '@sanity/visual-editing/react';

export default function DisableDraftMode() {
  const insidePresentation = useIsPresentationTool();
  if (insidePresentation !== false) return null;
  return (
    <a href="/api/draft-mode/disable" className="draft-mode-exit">
      Exit preview
    </a>
  );
}
