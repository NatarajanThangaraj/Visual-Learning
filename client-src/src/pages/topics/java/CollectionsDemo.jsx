import TopicPageLayout from '../../../components/TopicPageLayout';

export default function CollectionsDemo() {
  return (
    <TopicPageLayout
      badge="Java"
      accent="#C74634"
      accentBg="#FBEAE7"
      title="Collections Demo"
      lead="Explore Lists, Sets and Maps from the Java Collections Framework."
      codeHtml={`<span class="k">var</span> names = <span class="k">new</span> ArrayList&lt;String&gt;();\nnames.add(<span class="s">"Ada"</span>);\nnames.add(<span class="s">"Alan"</span>);\nnames.forEach(System.out::println);`}
    />
  );
}
