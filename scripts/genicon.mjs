import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'fs';

const GREEN = '#1FA47C';
const CREAM = '#FBF1E2';
const CARAMEL = '#D89A66';
const DARK = '#2B2722';

const face = `
  <ellipse cx="32" cy="46" rx="13" ry="21" fill="${CARAMEL}" transform="rotate(-24 32 46)"/>
  <ellipse cx="88" cy="46" rx="13" ry="21" fill="${CARAMEL}" transform="rotate(24 88 46)"/>
  <circle cx="60" cy="64" r="35" fill="${CREAM}"/>
  <ellipse cx="60" cy="78" rx="17" ry="13" fill="#FFFFFF"/>
  <circle cx="48" cy="60" r="5" fill="${DARK}"/>
  <circle cx="72" cy="60" r="5" fill="${DARK}"/>
  <circle cx="40" cy="72" r="4.5" fill="#F4C0B0" opacity="0.8"/>
  <circle cx="80" cy="72" r="4.5" fill="#F4C0B0" opacity="0.8"/>
  <ellipse cx="60" cy="74" rx="6.5" ry="5" fill="${DARK}"/>
  <path d="M60 79 C 60 86, 53 88, 50 84 M60 79 C 60 86, 67 88, 70 84" stroke="${DARK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
`;

function render(svg, size, out) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  writeFileSync(out, r.render().asPng());
  console.log('->', out, size);
}

const iconSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="${GREEN}"/><g transform="translate(512 512) scale(6) translate(-60 -64)">${face}</g></svg>`;
render(iconSvg, 1024, 'assets/images/icon.png');
render(iconSvg, 48, 'assets/images/favicon.png');

const splashSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><g transform="translate(256 256) scale(3.4) translate(-60 -64)">${face}</g></svg>`;
render(splashSvg, 512, 'assets/images/splash-icon.png');

const fgSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><g transform="translate(512 512) scale(4.4) translate(-60 -64)">${face}</g></svg>`;
render(fgSvg, 1024, 'assets/images/android-icon-foreground.png');
