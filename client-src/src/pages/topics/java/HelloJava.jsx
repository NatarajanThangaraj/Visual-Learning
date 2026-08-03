import TopicPageLayout from '../../../components/TopicPageLayout';

export default function HelloJava() {
  return (
    <TopicPageLayout
      badge="Java"
      accent="#C74634"
      accentBg="#FBEAE7"
      title="Hello, Java"
      lead="The starter Java assignment — a minimal program that prints a greeting."
      codeHtml={`<span class="k">public class</span> Main {\n  <span class="k">public static void</span> main(String[] args) {\n    System.out.println(<span class="s">"Hello, Java!"</span>);\n  }\n}`}
    />
  );
}
