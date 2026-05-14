'use client'

export function Architecture() {
  return (
    <section style={{ background: '#060810', padding: '4rem 1rem 3rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: 680, margin: '0 auto 1.5rem', padding: '0 .5rem' }}>
        <div>
          <p style={{ fontFamily: 'Syne', fontSize: 11, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: '#6ee7b7', marginBottom: 6 }}>Move to AI</p>
          <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(15px,2.5vw,20px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-.02em' }}>Architecture de la<br/>plateforme</h2>
        </div>
        <p style={{ fontFamily: 'Syne', fontSize: 'clamp(11px,1.8vw,14px)', fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.06em', textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.4 }}>Enterprise AI<br/>Platform</p>
      </div>

      {/* SVG isométrique */}
      <svg viewBox="0 0 680 520" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', maxWidth: 680, margin: '0 auto' }}>
        <defs>
          <style>{`
            @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
            @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
            @keyframes dash{to{stroke-dashoffset:-20}}
            @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
            .iso-icon{animation:floatUp 3s ease-in-out infinite}
            .iso-icon:nth-child(2){animation-delay:.4s}
            .iso-icon:nth-child(3){animation-delay:.8s}
            .iso-icon:nth-child(4){animation-delay:1.2s}
            .iso-icon:nth-child(5){animation-delay:1.6s}
            .iso-pulse{animation:pulse 2s ease-in-out infinite}
            .iso-dash{stroke-dasharray:5 4;animation:dash 1.2s linear infinite}
            .iso-layer{animation:fadeIn .8s ease both}
            .iso-layer:nth-child(1){animation-delay:.1s}
            .iso-layer:nth-child(2){animation-delay:.35s}
            .iso-layer:nth-child(3){animation-delay:.6s}
            .iso-layer:nth-child(4){animation-delay:.85s}
          `}</style>
        </defs>

        {/* LAYER 4 — Sources IA */}
        <g className="iso-layer">
          <polygon points="340,52 560,112 340,172 120,112" fill="#0d2a1f" stroke="#6ee7b7" strokeWidth=".8" strokeLinejoin="round"/>
          <polygon points="120,112 120,140 340,200 340,172" fill="#081a12" stroke="#6ee7b7" strokeWidth=".8"/>
          <polygon points="560,112 560,140 340,200 340,172" fill="#0b2318" stroke="#6ee7b7" strokeWidth=".8"/>
          <text fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#6ee7b7" letterSpacing=".1em">
            <tspan x="132" y="126">SOURCES IA</tspan>
            <tspan x="132" dy="11" fill="rgba(110,231,183,.5)" fontSize="8" fontWeight="400">Intelligence Layer</tspan>
          </text>
          <g className="iso-icon" style={{animationDelay:'0s'}}>
            <polygon points="340,60 356,68 340,76 324,68" fill="#6ee7b740" stroke="#6ee7b7" strokeWidth=".8"/>
            <line x1="340" y1="76" x2="340" y2="90" stroke="#6ee7b7" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="8.5" fill="#6ee7b7" textAnchor="middle" x="340" y="98">Data</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'.5s'}}>
            <rect x="214" y="104" width="28" height="20" rx="4" fill="#6ee7b720" stroke="#6ee7b7" strokeWidth=".8"/>
            <line x1="222" y1="112" x2="234" y2="112" stroke="#6ee7b7" strokeWidth=".8"/>
            <line x1="222" y1="116" x2="230" y2="116" stroke="#6ee7b7" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="8" fill="#6ee7b7" textAnchor="middle" x="228" y="133">Modèles IA</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'.9s'}}>
            <rect x="316" y="120" width="24" height="20" rx="3" fill="#6ee7b720" stroke="#6ee7b7" strokeWidth=".8"/>
            <polyline points="321,133 325,129 329,132 333,126" fill="none" stroke="#6ee7b7" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="8" fill="#6ee7b7" textAnchor="middle" x="328" y="150">Outils IA</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'1.3s'}}>
            <circle cx="432" cy="116" r="10" fill="#6ee7b720" stroke="#6ee7b7" strokeWidth=".8"/>
            <line x1="432" y1="108" x2="432" y2="110" stroke="#6ee7b7" strokeWidth="1"/>
            <line x1="432" y1="122" x2="432" y2="124" stroke="#6ee7b7" strokeWidth="1"/>
            <line x1="424" y1="116" x2="426" y2="116" stroke="#6ee7b7" strokeWidth="1"/>
            <line x1="438" y1="116" x2="440" y2="116" stroke="#6ee7b7" strokeWidth="1"/>
            <text fontFamily="Inter,sans-serif" fontSize="8" fill="#6ee7b7" textAnchor="middle" x="432" y="135">Intégrations</text>
          </g>
          <line className="iso-dash" x1="340" y1="172" x2="340" y2="198" stroke="#6ee7b7" strokeWidth=".8" opacity=".6"/>
        </g>

        {/* LAYER 3 — Orchestration IA */}
        <g className="iso-layer">
          <polygon points="340,200 560,260 340,320 120,260" fill="#0e1a2e" stroke="#38bdf8" strokeWidth=".8"/>
          <polygon points="120,260 120,288 340,348 340,320" fill="#091525" stroke="#38bdf8" strokeWidth=".8"/>
          <polygon points="560,260 560,288 340,348 340,320" fill="#0c1e38" stroke="#38bdf8" strokeWidth=".8"/>
          <text fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#38bdf8" letterSpacing=".1em">
            <tspan x="132" y="274">ORCHESTRATION IA</tspan>
            <tspan x="132" dy="11" fill="rgba(56,189,248,.5)" fontSize="8" fontWeight="400">Control &amp; API Layer</tspan>
          </text>
          <g className="iso-icon" style={{animationDelay:'.2s'}}>
            <rect x="316" y="236" width="48" height="28" rx="5" fill="#38bdf820" stroke="#38bdf8" strokeWidth=".9"/>
            <text fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#38bdf8" textAnchor="middle" x="340" y="246">API</text>
            <text fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(56,189,248,.6)" textAnchor="middle" x="340" y="258">Gateway</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'.6s'}}>
            <circle cx="232" cy="256" r="12" fill="#6ee7b720" stroke="#6ee7b7" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#6ee7b7" textAnchor="middle" x="232" y="254">AI</text>
            <text fontFamily="Inter,sans-serif" fontSize="6" fill="rgba(110,231,183,.6)" textAnchor="middle" x="232" y="263">Claude</text>
            <text fontFamily="Inter,sans-serif" fontSize="7.5" fill="#6ee7b7" textAnchor="middle" x="232" y="278">Moteur IA</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'1s'}}>
            <polygon points="448,248 460,256 448,264 436,256" fill="#a78bfa20" stroke="#a78bfa" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7.5" fill="#a78bfa" textAnchor="middle" x="448" y="276">Conformité</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'1.4s'}}>
            <rect x="472" y="268" width="36" height="20" rx="3" fill="#fbbf2420" stroke="#fbbf24" strokeWidth=".8"/>
            <polyline points="476,280 481,274 486,277 491,271 496,275 501,270" fill="none" stroke="#fbbf24" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7.5" fill="#fbbf24" textAnchor="middle" x="490" y="298">Monitoring</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'.3s'}}>
            <path d="M168 254 L176 250 L184 254 L184 264 Q180 268 176 270 Q172 268 168 264 Z" fill="#fb923c20" stroke="#fb923c" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7.5" fill="#fb923c" textAnchor="middle" x="176" y="283">Sécurité</text>
          </g>
          <line className="iso-dash" x1="340" y1="320" x2="340" y2="346" stroke="#38bdf8" strokeWidth=".8" opacity=".6" style={{animationDelay:'.3s'}}/>
        </g>

        {/* LAYER 2 — Move to AI Core */}
        <g className="iso-layer">
          <polygon points="340,348 560,408 340,468 120,408" fill="#0d1f0d" stroke="#6ee7b7" strokeWidth="1.2"/>
          <polygon points="120,408 120,436 340,496 340,468" fill="#081508" stroke="#6ee7b7" strokeWidth="1.2"/>
          <polygon points="560,408 560,436 340,496 340,468" fill="#0a1a0a" stroke="#6ee7b7" strokeWidth="1.2"/>
          <line x1="120" y1="408" x2="560" y2="408" stroke="#6ee7b7" strokeWidth="1.5" opacity=".4"/>
          <text fontFamily="Inter,sans-serif" fontSize="9" fontWeight="600" fill="#6ee7b7" letterSpacing=".1em">
            <tspan x="132" y="422">MOVE TO AI</tspan>
            <tspan x="132" dy="11" fill="rgba(110,231,183,.5)" fontSize="8" fontWeight="400">Core Platform</tspan>
          </text>
          <g className="iso-icon" style={{animationDelay:'.1s'}}>
            <rect x="196" y="385" width="36" height="28" rx="5" fill="#6ee7b730" stroke="#6ee7b7" strokeWidth=".9"/>
            <line x1="204" y1="393" x2="224" y2="393" stroke="#6ee7b7" strokeWidth=".8"/>
            <line x1="204" y1="398" x2="218" y2="398" stroke="#6ee7b7" strokeWidth=".8"/>
            <line x1="204" y1="403" x2="221" y2="403" stroke="#6ee7b7" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7" fill="#6ee7b7" textAnchor="middle" x="214" y="424">Opportunités</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'.5s'}}>
            <rect x="256" y="395" width="36" height="28" rx="5" fill="#6ee7b730" stroke="#6ee7b7" strokeWidth=".9"/>
            <polyline points="264,416 270,409 276,413 283,406" fill="none" stroke="#6ee7b7" strokeWidth=".9"/>
            <text fontFamily="Inter,sans-serif" fontSize="7" fill="#6ee7b7" textAnchor="middle" x="274" y="434">Use Cases</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'.9s'}}>
            <rect x="316" y="403" width="36" height="28" rx="5" fill="#6ee7b730" stroke="#6ee7b7" strokeWidth=".9"/>
            <text fontFamily="Inter,sans-serif" fontSize="9" fontWeight="700" fill="#6ee7b7" textAnchor="middle" x="334" y="421">ROI</text>
            <text fontFamily="Inter,sans-serif" fontSize="7" fill="rgba(110,231,183,.6)" textAnchor="middle" x="334" y="441">Dashboard</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'1.3s'}}>
            <circle cx="396" cy="406" r="8" fill="#6ee7b720" stroke="#6ee7b7" strokeWidth=".8"/>
            <circle cx="396" cy="403" r="3.5" fill="none" stroke="#6ee7b7" strokeWidth=".8"/>
            <path d="M389 413 Q396 410 403 413" fill="none" stroke="#6ee7b7" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7" fill="#6ee7b7" textAnchor="middle" x="396" y="425">7 Profils</text>
          </g>
          <g className="iso-icon" style={{animationDelay:'1.7s'}}>
            <rect x="432" y="396" width="36" height="28" rx="5" fill="#fb923c20" stroke="#fb923c" strokeWidth=".8"/>
            <circle cx="450" cy="405" r="4" fill="none" stroke="#fb923c" strokeWidth=".8"/>
            <line x1="445" y1="414" x2="455" y2="414" stroke="#fb923c" strokeWidth=".8"/>
            <text fontFamily="Inter,sans-serif" fontSize="7" fill="#fb923c" textAnchor="middle" x="450" y="435">Consultants</text>
          </g>
          <line className="iso-dash" x1="340" y1="468" x2="340" y2="490" stroke="#6ee7b7" strokeWidth=".8" opacity=".4" style={{animationDelay:'.5s'}}/>
        </g>

        {/* LAYER 1 — Fondation */}
        <g className="iso-layer">
          <polygon points="340,490 520,542 340,510 160,542" fill="#0a0f1a" stroke="rgba(255,255,255,.1)" strokeWidth=".5"/>
          <polygon points="160,542 160,510 340,510" fill="#080d16" stroke="rgba(255,255,255,.08)" strokeWidth=".5"/>
          <polygon points="520,542 520,510 340,510" fill="#090e18" stroke="rgba(255,255,255,.08)" strokeWidth=".5"/>
          <text fontFamily="Inter,sans-serif" fontSize="8" fontWeight="500" fill="rgba(255,255,255,.2)" letterSpacing=".12em" textAnchor="middle" x="340" y="530">SYSTÈMES ENTREPRISE · FONDATION</text>
          {([['ERP',216],['CRM',248],['SIRH',330],['Finance',405],['Ops',450]] as [string,number][]).map(([name,x]) => (
            <g key={name}>
              <rect x={x} y="492" width={name.length > 3 ? 28 : 20} height="14" rx="2" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.12)" strokeWidth=".5"/>
              <text fontFamily="Inter,sans-serif" fontSize="6" fill="rgba(255,255,255,.3)" textAnchor="middle" x={x+10} y="501">{name}</text>
            </g>
          ))}
        </g>

        {/* Callout droit — Human in the Loop */}
        <g style={{animation:'fadeIn .8s 1s ease both', opacity:0}}>
          <line x1="560" y1="280" x2="610" y2="260" stroke="rgba(110,231,183,.3)" strokeWidth=".8" strokeDasharray="3 3"/>
          <rect x="610" y="240" width="62" height="40" rx="8" fill="#0d2a1f" stroke="#6ee7b7" strokeWidth=".8"/>
          <circle cx="628" cy="252" r="6" fill="none" stroke="#6ee7b7" strokeWidth=".8"/>
          <path d="M622 262 Q628 259 634 262" fill="none" stroke="#6ee7b7" strokeWidth=".8"/>
          <text fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#6ee7b7" textAnchor="middle" x="641" y="258">Human</text>
          <text fontFamily="Inter,sans-serif" fontSize="6.5" fill="rgba(110,231,183,.6)" textAnchor="middle" x="641" y="270">in the Loop</text>
        </g>

        {/* Callout gauche — Utilisateurs */}
        <g style={{animation:'fadeIn .8s 1.2s ease both', opacity:0}}>
          <line x1="120" y1="408" x2="72" y2="390" stroke="rgba(110,231,183,.3)" strokeWidth=".8" strokeDasharray="3 3"/>
          <rect x="8" y="368" width="64" height="44" rx="8" fill="#0d2a1f" stroke="#6ee7b7" strokeWidth=".8"/>
          <text fontFamily="Inter,sans-serif" fontSize="7" fontWeight="600" fill="#6ee7b7" textAnchor="middle" x="40" y="383">Dirigeant</text>
          <text fontFamily="Inter,sans-serif" fontSize="6.5" fill="rgba(110,231,183,.6)" textAnchor="middle" x="40" y="395">Admin</text>
          <text fontFamily="Inter,sans-serif" fontSize="6.5" fill="rgba(110,231,183,.6)" textAnchor="middle" x="40" y="406">Consultant</text>
        </g>

        {/* Pulse dots */}
        <circle className="iso-pulse" cx="340" cy="196" r="3.5" fill="#6ee7b7" style={{animationDelay:'0s'}}/>
        <circle className="iso-pulse" cx="340" cy="344" r="3.5" fill="#38bdf8" style={{animationDelay:'.3s'}}/>
        <circle className="iso-pulse" cx="340" cy="466" r="3.5" fill="#6ee7b7" style={{animationDelay:'.6s'}}/>
      </svg>

      {/* Légende */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', maxWidth: 680, margin: '1.2rem auto 0', padding: '0 .5rem' }}>
        {[
          { color: '#6ee7b7', label: 'Sources IA & plateforme core' },
          { color: '#38bdf8', label: 'API & orchestration' },
          { color: '#a78bfa', label: 'Conformité & gouvernance' },
          { color: '#fb923c', label: 'Réseau consultants' },
          { color: 'rgba(255,255,255,.15)', label: 'Systèmes entreprise' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }}/>
            {label}
          </div>
        ))}
      </div>
    </section>
  )
}
