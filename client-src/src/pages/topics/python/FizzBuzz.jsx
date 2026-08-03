import TopicPageLayout from '../../../components/TopicPageLayout';

export default function FizzBuzz() {
  return (
    <TopicPageLayout
      badge="Python"
      accent="#2B6CB0"
      accentBg="#E6F0FA"
      title="FizzBuzz"
      lead="The classic FizzBuzz — practise loops and the modulo operator."
      codeHtml={`<span class="k">for</span> n <span class="k">in</span> range(1, 21):\n    <span class="k">if</span> n % 15 == 0: print(<span class="s">"FizzBuzz"</span>)\n    <span class="k">elif</span> n % 3 == 0: print(<span class="s">"Fizz"</span>)\n    <span class="k">elif</span> n % 5 == 0: print(<span class="s">"Buzz"</span>)\n    <span class="k">else</span>: print(n)`}
    />
  );
}
