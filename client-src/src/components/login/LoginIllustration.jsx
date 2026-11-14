/* The picture beside the sign-in: what the site does, drawn. A monitor shows a
   lesson — code on the left becoming a chart on the right — and around it float
   the four courses (in their accent colours), a flowchart for Problem Solving,
   a lab you can play, and a check for the step you just got right.

   The floating cards bob gently (login.css); reduced motion stills them. */
export default function LoginIllustration() {
  return (
    <svg
      className="login-art"
      viewBox="0 0 340 300"
      role="img"
      aria-label="A lesson on screen: code turning into a chart, with course, flowchart and lab cards around it"
    >
      {/* The glowing floor the monitor stands on. */}
      <ellipse cx="170" cy="272" rx="140" ry="16" fill="#0F2A5C" opacity=".7" />
      <ellipse cx="170" cy="272" rx="90" ry="9" fill="#1B3A7A" opacity=".6" />

      <circle cx="22" cy="100" r="2.5" fill="#3B82F6" />
      <circle cx="322" cy="150" r="2.5" fill="#3B82F6" />
      <circle cx="40" cy="262" r="2" fill="#E63946" />
      <path d="M318 96 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#3B82F6" opacity=".8" />

      {/* The monitor. */}
      <rect x="62" y="40" width="226" height="164" rx="12" fill="#0E1626" stroke="#22314F" />
      <circle cx="78" cy="54" r="3" fill="#E63946" />
      <circle cx="88" cy="54" r="3" fill="#F2B84B" />
      <circle cx="98" cy="54" r="3" fill="#2FBF71" />

      {/* Code… */}
      <rect x="74" y="66" width="96" height="104" rx="7" fill="#0A111F" stroke="#1C2A45" />
      <rect x="82" y="76" width="22" height="5" rx="2" fill="#E63946" />
      <rect x="108" y="76" width="40" height="5" rx="2" fill="#3B82F6" />
      <rect x="90" y="88" width="50" height="5" rx="2" fill="#5B6B8C" />
      <rect x="90" y="100" width="34" height="5" rx="2" fill="#3B82F6" />
      <rect x="128" y="100" width="24" height="5" rx="2" fill="#5B6B8C" />
      <rect x="98" y="112" width="44" height="5" rx="2" fill="#EEF2FF" opacity=".7" />
      <rect x="98" y="124" width="30" height="5" rx="2" fill="#5B6B8C" />
      <rect x="90" y="136" width="18" height="5" rx="2" fill="#3B82F6" />
      <rect x="82" y="148" width="10" height="5" rx="2" fill="#5B6B8C" />

      {/* …becomes a picture. */}
      <path d="M176 118 h14" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M188 113 l5 5 -5 5" fill="none" stroke="#3B82F6" strokeWidth="2" />
      <rect x="198" y="72" width="78" height="6" rx="3" fill="#3B82F6" />
      <rect x="200" y="132" width="13" height="30" rx="2" fill="#1B3A7A" />
      <rect x="217" y="112" width="13" height="50" rx="2" fill="#3B82F6" />
      <rect x="234" y="98" width="13" height="64" rx="2" fill="#EEF2FF" />
      <rect x="251" y="122" width="13" height="40" rx="2" fill="#1B3A7A" />
      <rect x="264" y="84" width="13" height="78" rx="2" fill="#E63946" />

      {/* Step-through progress, then the stand. */}
      <rect x="110" y="182" width="130" height="10" rx="5" fill="#1A2540" />
      <rect x="110" y="182" width="78" height="10" rx="5" fill="#3B82F6" />
      <circle cx="188" cy="187" r="6" fill="#EEF2FF" />
      <rect x="160" y="204" width="30" height="22" fill="#141E33" />
      <rect x="128" y="226" width="94" height="8" rx="4" fill="#1A2540" />

      <g className="login-float login-float-1">
        <circle cx="292" cy="44" r="17" fill="#0E1626" stroke="#3B82F6" strokeWidth="2" />
        <path d="M284 44 l6 6 11 -12" fill="none" stroke="#EEF2FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* The four courses: Java, Python, DBMS, Problem Solving. */}
      <g className="login-float login-float-2">
        <rect x="14" y="160" width="84" height="88" rx="9" fill="#111A2D" stroke="#24345A" />
        <rect x="14" y="160" width="84" height="12" rx="6" fill="#1B3A7A" />
        <rect x="24" y="182" width="64" height="11" rx="5.5" fill="#C74634" />
        <rect x="24" y="198" width="64" height="11" rx="5.5" fill="#2B6CB0" />
        <rect x="24" y="214" width="64" height="11" rx="5.5" fill="#0B7A63" />
        <rect x="24" y="230" width="64" height="11" rx="5.5" fill="#6D4AFF" />
      </g>

      {/* A lab, ready to play. */}
      <g className="login-float login-float-3">
        <rect x="250" y="190" width="80" height="62" rx="9" fill="#111A2D" stroke="#24345A" />
        <circle cx="276" cy="214" r="11" fill="#EEF2FF" />
        <path d="M272 208 l9 6 -9 6z" fill="#0F2A5C" />
        <rect x="260" y="236" width="60" height="5" rx="2.5" fill="#1A2540" />
        <rect x="260" y="236" width="30" height="5" rx="2.5" fill="#E63946" />
        <rect x="294" y="208" width="26" height="5" rx="2" fill="#5B6B8C" />
        <rect x="294" y="217" width="18" height="5" rx="2" fill="#5B6B8C" />
      </g>

      {/* A decision and its two branches. */}
      <g className="login-float login-float-1">
        <rect x="2" y="20" width="58" height="62" rx="8" fill="#111A2D" stroke="#24345A" />
        <path d="M31 30 l9 9 -9 9 -9 -9z" fill="none" stroke="#3B82F6" strokeWidth="1.6" />
        <path d="M26 45 l-8 12 M36 45 l8 12" stroke="#5B6B8C" strokeWidth="1.4" />
        <rect x="9" y="58" width="16" height="10" rx="2" fill="#1B3A7A" />
        <rect x="37" y="58" width="16" height="10" rx="2" fill="#E63946" opacity=".85" />
      </g>
    </svg>
  );
}
