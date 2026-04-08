import { useEffect } from 'react';

const DEFAULT_TITLE = 'DishDetail';
const DEFAULT_DESCRIPTION =
  'Discover local restaurants, read community reviews, and share dining experiences.';

function setMetaTag({ selector, attribute, attributeValue, content }) {
  let meta = document.head.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, attributeValue);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

export function usePageTitle(title, options) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    const description =
      typeof options === 'string' ? options : (
        (options.description ?? DEFAULT_DESCRIPTION)
      );

    document.title = pageTitle;

    setMetaTag({
      selector: 'meta[name="description"]',
      attribute: 'name',
      attributeValue: 'description',
      content: description,
    });

    setMetaTag({
      selector: 'meta[property="og:title"]',
      attribute: 'property',
      attributeValue: 'og:title',
      content: pageTitle,
    });

    setMetaTag({
      selector: 'meta[property="og:description"]',
      attribute: 'property',
      attributeValue: 'og:description',
      content: description,
    });
  }, [title, options]);
}
