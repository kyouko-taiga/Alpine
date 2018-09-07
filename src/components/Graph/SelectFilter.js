const GlowFilter = () => (
  <filter id="alpine-glow-filter" filterUnits="userSpaceOnUse" x="-40" y="-10" width="250" height="250">
    <feMorphology operator="dilate" in="SourceAlpha" radius="8" result="e1" />
    <feMorphology operator="dilate" in="SourceAlpha" radius="10" result="e2" />
    <feComposite in="e1" in2="e2" operator="xor" result="outline"/>
    <feColorMatrix type="matrix" in="outline" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .3 0" result="outline2" />
    <feComposite in="outline2" in2="SourceGraphic" operator="over" result="output"/>
  </filter>
)
