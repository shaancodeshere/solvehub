import { ImageResponse } from 'next/og';

export const alt = 'SolveHub — Computational Notepad & Instant Receipt Engine';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" viewBox="0 0 1500 1500" height="2000" version="1.0"><defs><clipPath id="bccaa4d8e9"><path d="M 0 0 L 400 0 L 400 400 L 0 400 Z" clip-rule="nonzero"/></clipPath><clipPath id="7274527421"><rect x="0" width="400" y="0" height="400"/></clipPath><clipPath id="2c33b875f4"><path d="M 0 0 L 1200 0 L 1200 400 L 0 400 Z" clip-rule="nonzero"/></clipPath><clipPath id="7de5a5f553"><rect x="0" width="1200" y="0" height="400"/></clipPath><clipPath id="e97d69c4a4"><path d="M 0 0 L 400 0 L 400 400 L 0 400 Z" clip-rule="nonzero"/></clipPath><clipPath id="b8ccc9cfd0"><rect x="0" width="400" y="0" height="400"/></clipPath><clipPath id="3324601b0e"><path d="M 0 0 L 400 0 L 400 600 L 0 600 Z" clip-rule="nonzero"/></clipPath><clipPath id="0fb1cfd0a9"><rect x="0" width="400" y="0" height="600"/></clipPath><clipPath id="50f764c321"><path d="M 0 140.589844 L 400 140.589844 L 400 800 L 0 800 Z" clip-rule="nonzero"/></clipPath><clipPath id="51cea61740"><path d="M 0 0.589844 L 400 0.589844 L 400 660 L 0 660 Z" clip-rule="nonzero"/></clipPath><clipPath id="4df4f1a981"><rect x="0" width="400" y="0" height="660"/></clipPath><clipPath id="11715ec889"><rect x="0" width="1200" y="0" height="1200"/></clipPath></defs><g transform="matrix(1, 0, 0, 1, 150, 150)"><g clip-path="url(#11715ec889)"><g transform="matrix(1, 0, 0, 1, 400, 800)"><g clip-path="url(#7274527421)"><g clip-path="url(#bccaa4d8e9)"><rect x="-1096" width="2592" fill="#cff060" y="-1495.999976" height="2591.999885" fill-opacity="1"/></g></g></g><g transform="matrix(1, 0, 0, 1, 0, 0)"><g clip-path="url(#7de5a5f553)"><g clip-path="url(#2c33b875f4)"><rect x="-696" width="2592" fill="#cff060" y="-695.999976" height="2591.999885" fill-opacity="1"/></g></g></g><g transform="matrix(1, 0, 0, 1, 800, 0)"><g clip-path="url(#b8ccc9cfd0)"><g clip-path="url(#e97d69c4a4)"><rect x="-1496" width="2592" fill="#cff060" y="-695.999976" height="2591.999885" fill-opacity="1"/></g></g></g><g transform="matrix(1, 0, 0, 1, 800, 200)"><g clip-path="url(#0fb1cfd0a9)"><g clip-path="url(#3324601b0e)"><rect x="-1496" width="2592" fill="#cff060" y="-895.999976" height="2591.999885" fill-opacity="1"/></g></g></g><g clip-path="url(#50f764c321)"><g transform="matrix(1, 0, 0, 1, 0, 140)"><g clip-path="url(#4df4f1a981)"><g clip-path="url(#51cea61740)"><path fill="#cff060" d="M 0 0.589844 L 400 0.589844 L 400 659.964844 L 0 659.964844 Z" fill-opacity="1" fill-rule="nonzero"/></g></g></g></g></g></svg>`;

const LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString('base64')}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#1c5f27',
          display: 'flex',
          flexDirection: 'column',
          padding: '36px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid rgba(207, 240, 96, 0.32)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 48px',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(22, 77, 31, 0.45)',
          }}
        >
          {/* Top Status Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: '#cff060',
                }}
              />
              <span
                style={{
                  color: 'rgba(207, 240, 96, 0.85)',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.14em',
                  fontWeight: 600,
                }}
              >
                SOLVEHUB // CANONICAL LEDGER ACTIVE
              </span>
            </div>
            <span
              style={{
                color: 'rgba(207, 240, 96, 0.65)',
                fontSize: '13px',
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
              }}
            >
              [ 487 DOMAIN CALCULATORS ]
            </span>
          </div>

          {/* Center Brand Lockup */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: '#cff060',
                  fontSize: '88px',
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1,
                }}
              >
                solvhub
              </span>
              <div
                style={{
                  width: '3px',
                  height: '64px',
                  backgroundColor: 'rgba(207, 240, 96, 0.4)',
                  margin: '0 28px',
                }}
              />
              <img
                src={LOGO_DATA_URI}
                width={76}
                height={76}
                alt="SolveHub Logo"
                style={{ width: 76, height: 76 }}
              />
            </div>
            <span
              style={{
                color: '#cff060',
                fontSize: '20px',
                fontFamily: 'monospace',
                letterSpacing: '0.22em',
                fontWeight: 600,
                marginTop: '32px',
                textTransform: 'uppercase',
              }}
            >
              {'COMPUTATIONAL NOTEPAD & INSTANT RECEIPT ENGINE'}
            </span>
          </div>

          {/* Bottom Terminal Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '1px solid rgba(207, 240, 96, 0.2)',
              paddingTop: '20px',
            }}
          >
            <span
              style={{
                color: 'rgba(207, 240, 96, 0.65)',
                fontSize: '13px',
                fontFamily: 'monospace',
                letterSpacing: '0.06em',
              }}
            >
              {'NATURAL LANGUAGE MATH • LIVE STRUCTURED LEDGER • 1-CLICK EXPORT'}
            </span>
            <span
              style={{
                color: '#cff060',
                fontSize: '18px',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              solvehub.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
