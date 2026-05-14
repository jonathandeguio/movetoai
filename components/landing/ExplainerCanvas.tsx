'use client'
import { useRef, useEffect, useState, useCallback } from 'react'

const GREEN='#6ee7b7', BLUE='#38bdf8', PURPLE='#a78bfa', AMBER='#fbbf24', CORAL='#fb923c'

const STEPS = [
  { lbl:'Étape 1 · Identification', title:"L'entreprise décrit ses défis en langage naturel",
    desc:"Un responsable RH tape « je perds 3h par semaine sur les congés ». L'IA comprend et détecte l'opportunité." },
  { lbl:'Étape 2 · Analyse IA', title:"Claude analyse et structure l'opportunité",
    desc:"L'API Anthropic reçoit le contexte (secteur, taille, rôle) et génère en 30s une fiche d'opportunité structurée avec ROI estimé." },
  { lbl:'Étape 3 · Use case', title:"La fiche use case complète est générée",
    desc:"KPIs, effort en jours, risques, solution recommandée — tout est produit automatiquement et validé par l'équipe." },
  { lbl:'Étape 4 · Déploiement', title:"Le consultant IA prend en charge la mission",
    desc:"Le brief est prêt. Un consultant certifié du réseau Move to AI démarre la mission en quelques jours." },
  { lbl:'Étape 5 · ROI mesuré', title:"Le ROI réel est suivi en continu",
    desc:"Estimé vs réel, comparé sur le dashboard. La transformation IA devient pilotable, mesurable, reproductible." },
]

const STEP_DUR = 4.5

function easeOut(t: number) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3) }

function rr(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number,fill?:string,stroke?:string,sw=0.5) {
  ctx.beginPath()
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r)
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r)
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r)
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r)
  ctx.closePath()
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke()}
}

function txt(ctx:CanvasRenderingContext2D,t:string,x:number,y:number,size:number,color:string,weight='400',align:CanvasTextAlign='center') {
  ctx.font=`${weight} ${size}px Inter,sans-serif`
  ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='middle'; ctx.fillText(t,x,y)
}

function circle(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,fill?:string,stroke?:string,sw=0.5) {
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2)
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.stroke()}
}

function dashLine(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,alpha:number,offset=0) {
  ctx.save(); ctx.globalAlpha=alpha; ctx.strokeStyle=color; ctx.lineWidth=1
  ctx.setLineDash([5,5]); ctx.lineDashOffset=-offset
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  ctx.setLineDash([]); ctx.restore()
}

function pulse(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string,t:number) {
  const p=(Math.sin(t*3)+1)/2
  ctx.save()
  ctx.globalAlpha=0.15+p*0.2; circle(ctx,x,y,r+p*8,undefined,color,0.5)
  ctx.globalAlpha=0.08+p*0.1; circle(ctx,x,y,r+p*16,undefined,color,0.5)
  ctx.restore()
}

function drawStep0(ctx:CanvasRenderingContext2D,t:number,W:number,_H:number) {
  const cx=W/2; const boxW=Math.min(320,W-80); const boxX=cx-boxW/2; const boxY=40; const boxH=60
  const alpha=easeOut(Math.min(t/0.5,1))
  ctx.save(); ctx.globalAlpha=alpha
  rr(ctx,boxX,boxY,boxW,boxH,10,'rgba(255,255,255,0.04)','rgba(255,255,255,0.12)')
  const words=['je perds','3h/semaine','sur les','congés...']
  const wc=Math.floor(t*2.2)
  words.slice(0,Math.min(wc+1,words.length)).forEach((_w,i)=>{
    const wa=easeOut(Math.min((t*2.2-i)/0.8,1))
    ctx.globalAlpha=alpha*wa
    txt(ctx,words.slice(0,i+1).join(' '),cx,boxY+boxH/2,14,'#fff')
  })
  const ca=(Math.sin(t*6)+1)/2
  ctx.globalAlpha=alpha*0.7*ca; ctx.fillStyle=GREEN; ctx.fillRect(cx+62,boxY+22,2,16)
  ctx.restore()
  const userX=cx,userY=165; const ua=easeOut(Math.min(t/0.3,1))
  ctx.save(); ctx.globalAlpha=ua
  circle(ctx,userX,userY,22,'rgba(110,231,183,0.12)',GREEN,1)
  ctx.strokeStyle=GREEN; ctx.lineWidth=1.5
  circle(ctx,userX,userY-6,8,undefined,GREEN,1.5)
  ctx.beginPath(); ctx.arc(userX,userY+18,16,Math.PI,0); ctx.stroke()
  txt(ctx,'Responsable RH',cx,userY+42,12,'rgba(255,255,255,0.5)')
  ctx.restore()
  if(t>1.5){
    const pa=easeOut(Math.min((t-1.5)/0.6,1))
    const tags=[{label:'RH',color:GREEN,x:cx-70},{label:'Congés',color:BLUE,x:cx},{label:'P0',color:AMBER,x:cx+70}]
    tags.forEach(tag=>{
      ctx.save(); ctx.globalAlpha=pa
      rr(ctx,tag.x-30,237,60,26,13,`${tag.color}22`,tag.color,0.8)
      txt(ctx,tag.label,tag.x,250,11,tag.color,'500')
      ctx.restore()
    })
  }
  if(t>2.5){
    const ga=easeOut(Math.min((t-2.5)/0.8,1))
    ctx.save(); ctx.globalAlpha=ga
    rr(ctx,cx-110,287,220,28,6,'rgba(110,231,183,0.08)',GREEN,0.5)
    txt(ctx,'Opportunité détectée — gain estimé : -75%',cx,301,11.5,GREEN,'500')
    ctx.restore()
  }
}

function drawStep1(ctx:CanvasRenderingContext2D,t:number,W:number,_H:number) {
  const cx=W/2; const lx=cx-Math.min(W*0.28,130); const rx=cx+Math.min(W*0.28,130); const my=_H/2-20
  ctx.save(); ctx.globalAlpha=easeOut(Math.min(t/0.4,1))
  rr(ctx,lx-55,my-55,110,110,14,'rgba(167,139,250,0.08)','#a78bfa',0.8)
  txt(ctx,'Profil',lx,my-18,12,'rgba(255,255,255,0.5)'); txt(ctx,'ETI · Finance',lx,my,13,'#fff','500')
  txt(ctx,'Resp. Métier',lx,my+18,11,'rgba(255,255,255,0.4)')
  ctx.restore()
  pulse(ctx,cx,my,46,GREEN,t*3)
  circle(ctx,cx,my,46,'rgba(110,231,183,0.1)',GREEN,1.2)
  txt(ctx,'Claude',cx,my-8,11,GREEN,'500'); txt(ctx,'Sonnet',cx,my+6,10,'rgba(110,231,183,0.6)')
  txt(ctx,'Analyse...',cx,my+20,10,'rgba(110,231,183,0.6)')
  if(t>0.5){dashLine(ctx,lx+55,my,cx-46,my,PURPLE,easeOut(Math.min((t-0.5)/0.5,1))*0.6,t*40)}
  if(t>1.2){
    const ra=easeOut(Math.min((t-1.2)/0.5,1))
    ctx.save(); ctx.globalAlpha=ra
    rr(ctx,rx-55,my-70,110,140,14,'rgba(56,189,248,0.08)',BLUE,0.8)
    txt(ctx,'Opportunité',rx,my-45,12,BLUE,'500')
    ;(['Gain : -75%','Complexité : low','Priorité : P0'] as string[]).forEach((it,i)=>txt(ctx,it,rx,my-20+i*20,11,'rgba(255,255,255,0.55)'))
    ctx.restore()
    dashLine(ctx,cx+46,my,rx-55,my,GREEN,ra*0.6,t*40)
  }
  if(t>2.8){
    const pa=easeOut(Math.min((t-2.8)/0.6,1))
    ctx.save(); ctx.globalAlpha=pa
    rr(ctx,cx-90,my+90,180,28,6,'rgba(110,231,183,0.1)',GREEN,0.5)
    txt(ctx,'Fiche générée en 28 secondes',cx,my+104,11.5,GREEN,'500')
    ctx.restore()
  }
}

function drawStep2(ctx:CanvasRenderingContext2D,t:number,W:number,H:number) {
  const cx=W/2; const cW=Math.min(W-80,340); const cX=cx-cW/2; const cY=28; const cH=H-60
  const ca=easeOut(Math.min(t/0.4,1))
  ctx.save(); ctx.globalAlpha=ca
  rr(ctx,cX,cY,cW,cH,14,'rgba(255,255,255,0.03)','rgba(255,255,255,0.1)')
  rr(ctx,cX,cY,cW,36,14,'rgba(110,231,183,0.08)',undefined)
  txt(ctx,'Fiche use case — Assistant RH Congés',cx,cY+18,12,GREEN,'500')
  ctx.restore()
  const fields=[
    {label:'KPI principal',val:'Temps RH : 3h → 20min/sem',color:GREEN,delay:0.3},
    {label:'ROI estimé',val:'-14 000 € / an',color:AMBER,delay:0.7},
    {label:'Effort',val:'12 jours · complexity: low',color:BLUE,delay:1.1},
    {label:'Solution',val:'Automation · Make + Claude API',color:PURPLE,delay:1.5},
    {label:'Risque',val:'Données RGPD — chiffrement',color:CORAL,delay:1.9},
  ]
  fields.forEach((f)=>{
    const fa=easeOut(Math.min((t-f.delay)/0.5,1)); if(fa<=0)return
    const fy=cY+58+fields.indexOf(f)*40
    ctx.save(); ctx.globalAlpha=ca*fa
    txt(ctx,f.label,cX+16,fy,10.5,'rgba(255,255,255,0.35)','500','left')
    txt(ctx,f.val,cX+16,fy+16,12,'#fff','400','left')
    ctx.strokeStyle=f.color; ctx.lineWidth=1.5; ctx.globalAlpha*=0.6
    ctx.beginPath(); ctx.moveTo(cX+8,fy-4); ctx.lineTo(cX+8,fy+22); ctx.stroke()
    ctx.restore()
  })
  if(t>2.8){
    const ba=easeOut(Math.min((t-2.8)/0.5,1))
    ctx.save(); ctx.globalAlpha=ba
    rr(ctx,cX+cW/2-80,cY+cH-38,160,28,8,'rgba(110,231,183,0.15)',GREEN,0.8)
    txt(ctx,'Soumettre pour validation →',cx,cY+cH-24,11.5,GREEN,'500')
    ctx.restore()
  }
}

function drawStep3(ctx:CanvasRenderingContext2D,t:number,W:number,_H:number) {
  const cx=W/2; const bW=Math.min(W*0.38,150); const gap=Math.min(W*0.08,40)
  const lx=cx-bW-gap/2; const rx=cx+gap/2; const tY=50
  const la=easeOut(Math.min(t/0.4,1))
  ctx.save(); ctx.globalAlpha=la
  rr(ctx,lx,tY,bW,100,12,'rgba(110,231,183,0.06)',GREEN,0.8)
  txt(ctx,'Use case',lx+bW/2,tY+28,12,GREEN,'500')
  txt(ctx,'Prêt à déployer',lx+bW/2,tY+48,11,'rgba(255,255,255,0.4)')
  txt(ctx,'KPIs ✓  Effort ✓  Validé ✓',lx+bW/2,tY+72,10.5,'rgba(255,255,255,0.4)')
  ctx.restore()
  if(t>0.8){dashLine(ctx,lx+bW,tY+50,rx,tY+50,GREEN,easeOut(Math.min((t-0.8)/0.5,1))*0.7,t*50)}
  if(t>1.2){
    const ra=easeOut(Math.min((t-1.2)/0.5,1))
    ctx.save(); ctx.globalAlpha=ra
    rr(ctx,rx,tY,bW,100,12,'rgba(251,146,60,0.08)',CORAL,0.8)
    circle(ctx,rx+bW/2,tY+28,18,'rgba(251,146,60,0.12)',CORAL,1)
    ctx.strokeStyle=CORAL; ctx.lineWidth=1.3
    circle(ctx,rx+bW/2,tY+22,8,undefined,CORAL,1.3)
    ctx.beginPath(); ctx.arc(rx+bW/2,tY+40,13,Math.PI,0); ctx.stroke()
    txt(ctx,'Marc Leroy',rx+bW/2,tY+58,11.5,'#fff','500')
    txt(ctx,'Consultant IA certifié',rx+bW/2,tY+74,10.5,'rgba(255,255,255,0.4)')
    txt(ctx,'Démarrage : J+3',rx+bW/2,tY+90,10.5,CORAL,'500')
    ctx.restore()
  }
  if(t>2){
    const pa=easeOut(Math.min((t-2)/0.6,1))
    const stack=[{n:'Make',c:PURPLE,x:cx-80},{n:'Claude',c:GREEN,x:cx},{n:'Notion',c:BLUE,x:cx+80}]
    txt(ctx,'Stack de déploiement',cx,175,10.5,'rgba(255,255,255,0.3)')
    stack.forEach(s=>{
      ctx.save(); ctx.globalAlpha=pa
      rr(ctx,s.x-28,185,56,28,8,`${s.c}18`,s.c,0.7)
      txt(ctx,s.n,s.x,199,11.5,s.c,'500')
      ctx.restore()
    })
  }
  if(t>3){
    const ga=easeOut(Math.min((t-3)/0.6,1))
    ctx.save(); ctx.globalAlpha=ga
    rr(ctx,cx-110,230,220,32,8,'rgba(110,231,183,0.08)',GREEN,0.5)
    txt(ctx,'Mission lancée — délai 3× inférieur au consulting',cx,246,11.5,GREEN,'500')
    ctx.restore()
  }
}

function drawStep4(ctx:CanvasRenderingContext2D,t:number,W:number,_H:number) {
  const cx=W/2
  const metrics=[
    {label:'Temps traitement',before:'3h/sem',after:'-75%',pct:75,color:GREEN,x:cx-Math.min(W*0.28,110)},
    {label:'ROI annuel',before:'0€',after:'-14k€',pct:100,color:AMBER,x:cx},
    {label:'Satisfaction',before:'3.2/5',after:'4.6/5',pct:44,color:BLUE,x:cx+Math.min(W*0.28,110)},
  ]
  metrics.forEach((m,i)=>{
    const delay=i*0.4; const ma=easeOut(Math.min((t-delay)/0.6,1)); if(ma<=0)return
    const bw=Math.min(W*0.22,88); const bh=170; const bx=m.x-bw/2; const by=55
    ctx.save(); ctx.globalAlpha=ma
    rr(ctx,bx,by,bw,bh,12,'rgba(255,255,255,0.03)','rgba(255,255,255,0.08)')
    txt(ctx,m.label,m.x,by+18,10.5,'rgba(255,255,255,0.4)')
    const bY=by+35; const barW=bw-24; const barX=bx+12
    rr(ctx,barX,bY,barW,80,4,'rgba(255,255,255,0.04)')
    const fH=(m.pct/100)*80*easeOut(Math.min((t-delay-0.2)/0.8,1))
    rr(ctx,barX,bY+80-fH,barW,fH,4,`${m.color}55`)
    txt(ctx,m.before,m.x,bY+80+14,10.5,'rgba(255,255,255,0.3)')
    txt(ctx,'→',m.x,bY+80+30,11,'rgba(255,255,255,0.2)')
    ctx.globalAlpha*=easeOut(Math.min((t-delay-0.6)/0.5,1))
    txt(ctx,m.after,m.x,bY+80+46,13,m.color,'500')
    ctx.restore()
  })
  if(t>2.4){
    const ra=easeOut(Math.min((t-2.4)/0.6,1))
    ctx.save(); ctx.globalAlpha=ra
    const cX=cx-Math.min(W*0.38,150); const cW=Math.min(W*0.76,300)
    rr(ctx,cX,248,cW,66,10,'rgba(255,255,255,0.03)','rgba(255,255,255,0.07)')
    txt(ctx,'Estimé vs réel · use case RH Congés',cx,260,10.5,'rgba(255,255,255,0.35)')
    const pts1=[0,0.3,0.55,0.72,0.85,1.0]; const pts2=[0,0.28,0.60,0.78,0.91,1.0]
    const prog=easeOut(Math.min((t-2.4)/1.2,1)); const act=Math.floor(prog*(pts1.length-1))
    ;[pts1,pts2].forEach((pts,li)=>{
      ctx.strokeStyle=li===0?GREEN:AMBER; ctx.lineWidth=1.5
      if(li===1)ctx.setLineDash([4,3])
      ctx.globalAlpha=0.8; ctx.beginPath()
      pts.forEach((p,pi)=>{
        if(pi>act)return
        const px=cX+12+pi*((cW-24)/(pts.length-1)); const py=268+(50-10)*(1-p)*0.9
        pi===0?ctx.moveTo(px,py):ctx.lineTo(px,py)
      })
      ctx.stroke(); ctx.setLineDash([])
    })
    txt(ctx,'— Estimé',cX+16,304,10,GREEN,'400','left')
    txt(ctx,'— Réel',cX+80,304,10,AMBER,'400','left')
    ctx.restore()
  }
  if(t>3.5){
    const fa=easeOut(Math.min((t-3.5)/0.5,1))
    ctx.save(); ctx.globalAlpha=fa
    rr(ctx,cx-100,315,200,28,8,'rgba(110,231,183,0.12)',GREEN,0.8)
    txt(ctx,'Transformation IA pilotable',cx,329,12,GREEN,'500')
    ctx.restore()
  }
}

const DRAW_FNS = [drawStep0,drawStep1,drawStep2,drawStep3,drawStep4]

export function ExplainerCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const state = useRef({ globalT:0, stepT:0, step:0, playing:true, lastTS:0, raf:0 })

  const updateLabels = useCallback((i:number) => setStep(i), [])

  useEffect(() => {
    const canvas = ref.current; if(!canvas)return
    const ctx = canvas.getContext('2d')!

    function resize() { canvas.width=canvas.offsetWidth; canvas.height=340 }
    resize()
    window.addEventListener('resize',resize)

    function loop(ts:number) {
      const s=state.current
      if(!s.lastTS)s.lastTS=ts
      const dt=Math.min((ts-s.lastTS)/1000,0.05); s.lastTS=ts
      if(s.playing){ s.globalT+=dt; s.stepT+=dt }
      if(s.stepT>=STEP_DUR){ s.stepT=0; s.step=(s.step+1)%5; updateLabels(s.step) }
      const pct=(s.globalT%(5*STEP_DUR))/(5*STEP_DUR)*100
      const fill=document.getElementById('exp-fill')
      if(fill)(fill as HTMLElement).style.width=pct+'%'
      ctx.clearRect(0,0,canvas.width,canvas.height)
      DRAW_FNS[s.step](ctx,s.stepT,canvas.width,canvas.height)
      s.raf=requestAnimationFrame(loop)
    }
    state.current.raf=requestAnimationFrame(loop)
    return ()=>{ cancelAnimationFrame(state.current.raf); window.removeEventListener('resize',resize) }
  },[updateLabels])

  function togglePlay() {
    state.current.playing=!state.current.playing
    state.current.lastTS=0
    setPlaying(p=>!p)
  }

  function goStep(i:number) {
    state.current.step=i; state.current.stepT=0
    state.current.globalT=i*STEP_DUR
    updateLabels(i)
  }

  const s=STEPS[step]
  return (
    <section style={{background:'#060810',padding:'4rem 1.5rem',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <p style={{fontSize:11,fontWeight:500,letterSpacing:'.16em',textTransform:'uppercase',color:'#6ee7b7',marginBottom:8}}>
          {s.lbl}
        </p>
        <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(1.2rem,2.5vw,1.6rem)',fontWeight:700,color:'#fff',letterSpacing:'-.02em',marginBottom:4}}>
          {s.title}
        </h2>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.6,minHeight:40,marginBottom:16}}>{s.desc}</p>

        <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,overflow:'hidden'}}>
          <canvas ref={ref} height={340} style={{display:'block',width:'100%'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              style={{width:32,height:32,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'rgba(255,255,255,0.7)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}
            >
              {playing
                ? <svg width="10" height="12" viewBox="0 0 10 12"><rect x="0" y="0" width="3" height="12" fill="currentColor"/><rect x="6" y="0" width="3" height="12" fill="currentColor"/></svg>
                : <svg width="10" height="12" viewBox="0 0 10 12"><polygon points="0,0 10,6 0,12" fill="currentColor"/></svg>}
            </button>
            <div
              role="slider"
              aria-label="Progression"
              aria-valuenow={step}
              aria-valuemin={0}
              aria-valuemax={4}
              tabIndex={0}
              onClick={(e)=>{
                const r=e.currentTarget.getBoundingClientRect()
                const pct=(e.clientX-r.left)/r.width
                const g=pct*5*STEP_DUR; state.current.globalT=g
                state.current.step=Math.min(Math.floor(g/STEP_DUR),4)
                state.current.stepT=g-state.current.step*STEP_DUR
                state.current.lastTS=0; updateLabels(state.current.step)
              }}
              style={{flex:1,height:3,background:'rgba(255,255,255,0.08)',borderRadius:999,overflow:'hidden',cursor:'pointer'}}
            >
              <div id="exp-fill" style={{height:'100%',background:'#6ee7b7',borderRadius:999,width:'0%',transition:'width .1s linear'}}/>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              {STEPS.map((_,i)=>(
                <button
                  key={i}
                  onClick={()=>goStep(i)}
                  aria-label={`Étape ${i+1}`}
                  style={{width:7,height:7,borderRadius:'50%',background:i===step?'#6ee7b7':'rgba(255,255,255,0.15)',cursor:'pointer',transition:'background .2s',border:'none',padding:0}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
