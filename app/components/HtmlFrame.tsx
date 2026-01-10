'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface HtmlFrameProps {
  html: string;
  title?: string;
}

// Streaming HTML Frame - renders HTML progressively as chunks arrive
interface StreamingHtmlFrameProps {
  htmlChunks: string;
  isComplete: boolean;
  title?: string;
}

// Simple hash function to detect different documents
function simpleHash(str: string): number {
  let hash = 0;
  const sample = str.slice(0, 500); // Only hash first 500 chars for speed
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function StreamingHtmlFrame({ htmlChunks, isComplete, title }: StreamingHtmlFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(450);
  const [isVisible, setIsVisible] = useState(false);
  const writtenLength = useRef(0);
  const docOpened = useRef(false);
  const documentHashRef = useRef<number>(0); // Hash of document start to detect new docs

  // Minimum content length before showing iframe (approximates ~100px of content)
  // This accounts for HTML tags, so we look for content after <body>
  const MIN_BODY_CONTENT_LENGTH = 200;

  // Strip markdown code block markers from HTML
  const stripCodeBlockMarkers = useCallback((text: string) => {
    // Remove opening ```html marker
    let cleaned = text.replace(/^[\s\S]*?```html\s*/, '');
    // Remove closing ``` - can appear at end or before </body></html>
    if (isComplete) {
      cleaned = cleaned.replace(/\n```\s*$/, '');
      // Debug: log the last 100 chars to see the ending
      console.log('[StreamingHtml] Last 100 chars:', JSON.stringify(cleaned.slice(-100)));
    }
    // Also remove ``` that appears before closing tags (Gemini sometimes outputs this way)
    cleaned = cleaned.replace(/```\s*(<\/body>)/gi, '$1');
    cleaned = cleaned.replace(/```\s*(<\/html>)/gi, '$1');
    // Also try removing standalone ``` near the end
    cleaned = cleaned.replace(/```\s*$/g, '');
    return cleaned;
  }, [isComplete]);

  // Check if we have enough content to show the iframe
  const checkVisibility = useCallback((html: string) => {
    if (isVisible) return; // Already visible

    // Look for content after <body> tag
    const bodyMatch = html.toLowerCase().indexOf('<body');
    if (bodyMatch !== -1) {
      const afterBody = html.slice(bodyMatch);
      const bodyTagEnd = afterBody.indexOf('>');
      if (bodyTagEnd !== -1) {
        const bodyContent = afterBody.slice(bodyTagEnd + 1);
        // Check if we have enough content in the body
        if (bodyContent.length >= MIN_BODY_CONTENT_LENGTH) {
          setIsVisible(true);
        }
      }
    }
  }, [isVisible]);

  // Update height based on content
  const updateHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc?.body) {
        const contentHeight = doc.body.scrollHeight;
        if (contentHeight > 0) {
          setHeight(Math.min(contentHeight + 50, 4800));
        }
      }
    } catch {
      // Cross-origin access might fail, ignore
    }
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const cleanedHtml = stripCodeBlockMarkers(htmlChunks);

    // Check if we should show the iframe based on content length
    checkVisibility(cleanedHtml);

    // Detect if this is a completely new document using hash
    const currentHash = simpleHash(cleanedHtml);
    const isNewDocument = documentHashRef.current !== 0 &&
      cleanedHtml.length > 100 &&
      writtenLength.current > 100 &&
      currentHash !== documentHashRef.current &&
      // Also check that new content doesn't start with what we already wrote
      !cleanedHtml.startsWith(cleanedHtml.slice(0, Math.min(100, writtenLength.current)));

    if (isNewDocument) {
      // Reset for new document
      console.log('[StreamingHtml] Detected new document (hash mismatch), resetting');
      try {
        doc.open();
        doc.write('');
        doc.close();
      } catch { /* ignore */ }
      writtenLength.current = 0;
      docOpened.current = false;
      documentHashRef.current = 0;
      setIsVisible(false);
      setHeight(450);
    }

    // Open document on first chunk
    if (!docOpened.current && cleanedHtml.length > 0) {
      doc.open();
      docOpened.current = true;
      writtenLength.current = 0;
      documentHashRef.current = currentHash;
    }

    // Write new content - but verify we're continuing the same document
    if (docOpened.current && cleanedHtml.length > writtenLength.current) {
      const newContent = cleanedHtml.slice(writtenLength.current);
      try {
        doc.write(newContent);
        writtenLength.current = cleanedHtml.length;
      } catch (e) {
        console.error('[StreamingHtml] Error writing to document:', e);
        // Reset on error
        writtenLength.current = 0;
        docOpened.current = false;
        documentHashRef.current = 0;
      }

      // Update height periodically
      updateHeight();
    }

    // Close document when complete
    if (isComplete && docOpened.current) {
      try {
        doc.close();
      } catch { /* ignore */ }
      // Final height updates
      setTimeout(updateHeight, 100);
      setTimeout(updateHeight, 500);
    }
  }, [htmlChunks, isComplete, stripCodeBlockMarkers, updateHeight, checkVisibility]);

  // Reset when component remounts
  useEffect(() => {
    return () => {
      writtenLength.current = 0;
      docOpened.current = false;
      documentHashRef.current = 0;
    };
  }, []);

  // Always show when complete (in case content is small)
  useEffect(() => {
    if (isComplete) {
      setIsVisible(true);
    }
  }, [isComplete]);

  const handleShare = () => {
    // TODO: Implement share actions
    console.log('Share clicked - streaming frame');
  };

  return (
    <div className="html-frame" style={{ display: isVisible ? 'block' : 'none' }}>
      <button className="html-frame-share" onClick={handleShare} title="Share">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>
      {title && <div className="html-frame-title">{title}</div>}
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          display: 'block',
          background: '#fff',
        }}
        sandbox="allow-scripts allow-same-origin"
        title={title || 'HTML Content'}
      />
    </div>
  );
}

export default function HtmlFrame({ html, title }: HtmlFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(450);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Function to update height based on content
    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc?.body) {
          const contentHeight = doc.body.scrollHeight;
          if (contentHeight > 0) {
            setHeight(Math.min(contentHeight + 50, 4800)); // Add 50px padding, max 4800px
          }
        }
      } catch {
        // Cross-origin access might fail, ignore
      }
    };

    // Update height after content loads
    iframe.onload = updateHeight;

    // Also update after delays for async content
    const timer = setTimeout(updateHeight, 100);
    const timer2 = setTimeout(updateHeight, 500);
    const timer3 = setTimeout(updateHeight, 1000);

    // Listen for resize messages from the iframe content
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'resize' && typeof event.data.height === 'number') {
        setHeight(Math.min(event.data.height + 50, 4800));
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('message', handleMessage);
    };
  }, [html]);

  // Ensure HTML has proper structure
  const fullHtml = html.toLowerCase().includes('<html') ? html : `<!DOCTYPE html><html><body>${html}</body></html>`;

  const handleShare = () => {
    // TODO: Implement share actions
    console.log('Share clicked', { html: fullHtml });
  };

  return (
    <div className="html-frame">
      <button className="html-frame-share" onClick={handleShare} title="Share">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>
      {title && <div className="html-frame-title">{title}</div>}
      <iframe
        ref={iframeRef}
        srcDoc={fullHtml}
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          display: 'block',
          background: '#fff',
        }}
        sandbox="allow-scripts allow-same-origin"
        title={title || 'HTML Content'}
      />
    </div>
  );
}

// Helper to detect if text contains HTML content that should be rendered
export function isHtmlContent(text: string): boolean {
  const trimmed = text.trim();

  // Check for HTML document markers (direct HTML at start)
  const lowerTrimmed = trimmed.toLowerCase();
  if (lowerTrimmed.startsWith('<!doctype html')) return true;
  if (lowerTrimmed.startsWith('<html')) return true;

  // Check for markdown code block with html language tag
  // Use \n``` to find closing backticks on their own line (avoids matching backticks inside JS template literals)
  const htmlCodeBlockMatch = trimmed.match(/```html\s*([\s\S]*?)\n```/) || trimmed.match(/```html\s*([\s\S]*)```$/);
  if (htmlCodeBlockMatch) {
    const htmlContent = htmlCodeBlockMatch[1].trim().toLowerCase();
    if (htmlContent.startsWith('<!doctype html') || htmlContent.startsWith('<html')) {
      return true;
    }
  }

  // Check for plain code block that contains HTML
  const plainCodeBlockMatch = trimmed.match(/```\s*([\s\S]*?)\n```/) || trimmed.match(/```\s*([\s\S]*)```$/);
  if (plainCodeBlockMatch) {
    const content = plainCodeBlockMatch[1].trim().toLowerCase();
    if (content.startsWith('<!doctype html') || content.startsWith('<html')) {
      return true;
    }
  }

  // Check for raw HTML anywhere in the text (not in code block)
  // Look for full HTML document structure
  if (lowerTrimmed.includes('<!doctype html') && lowerTrimmed.includes('</html>')) {
    return true;
  }
  if (lowerTrimmed.includes('<html') && lowerTrimmed.includes('</html>')) {
    return true;
  }

  return false;
}

// Extract HTML and surrounding text from content
// Returns { beforeText, html, afterText } or null if no HTML found
export function extractHtmlParts(text: string): { beforeText: string; html: string; afterText: string } | null {
  const trimmed = text.trim();

  // Check for markdown HTML code block - use \n``` to find closing on its own line
  const htmlCodeBlockMatch = trimmed.match(/^([\s\S]*?)```html\s*([\s\S]*?)\n```([\s\S]*)$/) ||
                              trimmed.match(/^([\s\S]*?)```html\s*([\s\S]*)```$/);
  if (htmlCodeBlockMatch) {
    const htmlContent = htmlCodeBlockMatch[2].trim();
    const htmlLower = htmlContent.toLowerCase();
    if (htmlLower.startsWith('<!doctype html') || htmlLower.startsWith('<html')) {
      return {
        beforeText: htmlCodeBlockMatch[1].trim(),
        html: htmlContent,
        afterText: (htmlCodeBlockMatch[3] || '').trim(),
      };
    }
  }

  // Check for plain code block containing HTML - use \n``` to find closing on its own line
  const plainCodeBlockMatch = trimmed.match(/^([\s\S]*?)```\s*([\s\S]*?)\n```([\s\S]*)$/) ||
                               trimmed.match(/^([\s\S]*?)```\s*([\s\S]*)```$/);
  if (plainCodeBlockMatch) {
    const htmlContent = plainCodeBlockMatch[2].trim();
    const htmlLower = htmlContent.toLowerCase();
    if (htmlLower.startsWith('<!doctype html') || htmlLower.startsWith('<html')) {
      return {
        beforeText: plainCodeBlockMatch[1].trim(),
        html: htmlContent,
        afterText: (plainCodeBlockMatch[3] || '').trim(),
      };
    }
  }

  // Check for direct HTML (entire content is HTML)
  const lowerTrimmed = trimmed.toLowerCase();
  if (lowerTrimmed.startsWith('<!doctype html') || lowerTrimmed.startsWith('<html')) {
    return {
      beforeText: '',
      html: trimmed,
      afterText: '',
    };
  }

  // Check for raw HTML anywhere in text (not in code block)
  // Look for <!DOCTYPE html> ... </html> pattern
  const rawHtmlMatch = trimmed.match(/^([\s\S]*?)(<!DOCTYPE html[\s\S]*<\/html>)([\s\S]*)$/i);
  if (rawHtmlMatch) {
    return {
      beforeText: rawHtmlMatch[1].trim(),
      html: rawHtmlMatch[2].trim(),
      afterText: rawHtmlMatch[3].trim(),
    };
  }

  // Also check for <html> ... </html> without DOCTYPE
  const rawHtmlMatch2 = trimmed.match(/^([\s\S]*?)(<html[\s\S]*<\/html>)([\s\S]*)$/i);
  if (rawHtmlMatch2) {
    return {
      beforeText: rawHtmlMatch2[1].trim(),
      html: rawHtmlMatch2[2].trim(),
      afterText: rawHtmlMatch2[3].trim(),
    };
  }

  return null;
}

// Simple extraction for backward compatibility
export function extractHtml(text: string): string {
  const parts = extractHtmlParts(text);
  return parts?.html || text;
}
