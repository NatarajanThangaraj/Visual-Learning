import TopicPageLayout from '../../../components/TopicPageLayout';

export default function RegexTester() {
  return (
    <TopicPageLayout
      badge="JavaScript"
      accent="#6B7280"
      accentBg="#EEF0F3"
      title="Regex Tester"
      lead="A small tool to test regular expressions against sample text."
      codeHtml={`<span class="k">const</span> re = /\\b\\w+@\\w+\\.\\w+\\b/g;\n<span class="k">const</span> text = <span class="s">"ping ada@x.io or alan@y.dev"</span>;\nconsole.log(text.match(re));`}
    />
  );
}
