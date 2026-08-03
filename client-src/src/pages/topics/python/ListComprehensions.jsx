import TopicPageLayout from '../../../components/TopicPageLayout';

export default function ListComprehensions() {
  return (
    <TopicPageLayout
      badge="Python"
      accent="#2B6CB0"
      accentBg="#E6F0FA"
      title="List Comprehensions"
      lead="Build and filter lists in a single expressive line."
      codeHtml={`<span class="c"># squares of even numbers 0..9</span>\nsquares = [n*n <span class="k">for</span> n <span class="k">in</span> range(10) <span class="k">if</span> n % 2 == 0]\nprint(squares)  <span class="c"># [0, 4, 16, 36, 64]</span>`}
    />
  );
}
