'use client';

import { useEffect, useRef, useState } from 'react';

interface HtmlFrameProps {
  html: string;
  title?: string;
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

  return (
    <div className="html-frame">
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
