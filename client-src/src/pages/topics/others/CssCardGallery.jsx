import TopicPageLayout from '../../../components/TopicPageLayout';

export default function CssCardGallery() {
  return (
    <TopicPageLayout
      badge="HTML / CSS"
      accent="#6B7280"
      accentBg="#EEF0F3"
      title="CSS Card Gallery"
      lead="A responsive card layout built with CSS grid and flexbox."
      codeHtml={`<span class="k">.gallery</span> {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 20px;\n}`}
    />
  );
}
