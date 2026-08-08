import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/* ── Animated counter ── */
const Counter = ({ target }) => {
  const num = parseInt(target, 10);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (isNaN(num)) { setVal(target); return; }
    let v = 0;
    const step = Math.ceil(num / 40);
    const t = setInterval(() => {
      v += step;
      if (v >= num) { setVal(num); clearInterval(t); }
      else setVal(v);
    }, 30);
    return () => clearInterval(t);
  }, [num, target]);
  return <>{val}</>;
};

/* ── Mini sparkline SVG ── */
const Sparkline = () => (
  <svg width="80" height="24" viewBox="0 0 80 24">
    <polyline points="0,20 13,15 26,17 39,8 52,13 65,4 78,7"
      fill="none" stroke="#00D9FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Mini bar chart SVG ── */
const BarChart = () => (
  <svg width="80" height="24" viewBox="0 0 80 24">
    {[4,8,6,14,10,18,12,16,20].map((h, i) => (
      <rect key={i} x={i*9} y={24-h} width="6" height={h} rx="1"
        fill="#00D9FF" opacity={0.3 + i*0.08}/>
    ))}
  </svg>
);

/* ── Network dots SVG ── */
const NetworkDots = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    {[[8,20],[20,8],[20,32],[32,20]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="3" fill="#00D9FF"/>
    ))}
    {[[8,20,20,8],[8,20,20,32],[20,8,32,20],[20,32,32,20]].map(([x1,y1,x2,y2],i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00D9FF" strokeWidth="1" opacity="0.5"/>
    ))}
  </svg>
);

/* ── Radar SVG ── */
const Radar = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{animation:'spin 5s linear infinite'}}>
    <circle cx="20" cy="20" r="17" stroke="#00D9FF" strokeWidth="0.8" strokeDasharray="4 3" fill="none"/>
    <circle cx="20" cy="20" r="10" stroke="#00D9FF" strokeWidth="0.8" fill="none"/>
    <circle cx="20" cy="20" r="3" fill="#00D9FF"/>
  </svg>
);

/* ── Pulse rings SVG ── */
const PulseRings = () => (
  <svg width="40" height="40" viewBox="0 0 40 40">
    {[17,11,5].map((r, i) => (
      <circle key={i} cx="20" cy="20" r={r} stroke="#00D9FF" strokeWidth="0.7"
        fill="none" opacity={0.3 + i*0.25}/>
    ))}
  </svg>
);

const glass = {
  background: 'rgba(10,18,35,0.78)',
  border: '1px solid rgba(0,217,255,0.18)',
  backdropFilter: 'blur(14px)',
  borderRadius: '16px',
};

const label = {
  display:'block', fontSize:'10.5px', color:'#9AA4B2',
  fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px',
};

const inputStyle = {
  width:'100%', backgroundColor:'rgba(11,18,32,0.9)',
  border:'1px solid rgba(0,217,255,0.25)', borderRadius:'10px',
  padding:'13px 16px', color:'#FFFFFF', fontSize:'14.5px',
  outline:'none', boxSizing:'border-box', transition:'border-color .2s',
};

export default function CitizenLogin() {
  const { user, citizenLogin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEyeHovered, setIsEyeHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  useEffect(() => {
    if (!user) return;
    const routes = { citizen:'/citizen/dashboard', admin:'/admin/dashboard', analyst:'/analyst/dashboard' };
    navigate(routes[user.role] || '/officer/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email/mobile and password.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await citizenLogin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/citizen/dashboard');
    } else {
      setError(result.message || 'Invalid login credentials.');
    }
  };

  /* ─────────────────────────────────── RENDER ─────────────────────────────────── */
  return (
    <div style={{
      height:'100vh', width:'100vw', overflow:'hidden',
      backgroundImage:"url('/assets/citizen_bg_clean.jpg')",
      backgroundSize:'cover', backgroundPosition:'center',
      backgroundRepeat:'no-repeat', backgroundAttachment:'fixed',
      backgroundColor:'#060D1A',
      fontFamily:"'Inter', 'Segoe UI', sans-serif",
      color:'#FFFFFF',
      display:'flex', flexDirection:'column',
      boxSizing:'border-box', position:'relative',
    }}>
      {/* Very light overlay — keeps background fully visible */}
      <div style={{position:'absolute',inset:0,background:'rgba(6,13,26,0.38)',zIndex:0,pointerEvents:'none'}}/>

      {/* ═══════════════ MAIN BODY ═══════════════ */}
      <div className="citizen-login-body" style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 28px 0 28px', gap:'20px', zIndex:1, position:'relative',
        minHeight:0,
      }}>

        {/* ══════ LEFT PANEL ══════ */}
        <div className="citizen-left-panel" style={{width:'220px', flexShrink:0, display:'flex', flexDirection:'column', gap:'12px', alignSelf:'stretch', justifyContent:'center'}}>

          {/* Logo */}
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'6px',
                background:'linear-gradient(135deg,#00D9FF22,#00D9FF44)',
                border:'1px solid rgba(0,217,255,0.4)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>🛡️</div>
              <div>
                <div style={{fontSize:'15px',fontWeight:'900',letterSpacing:'-0.01em',lineHeight:1}}>
                  CRIMEPILOT <span style={{color:'#00D9FF'}}>AI</span>
                </div>
                <div style={{fontSize:'7px',color:'#00D9FF',fontWeight:'800',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                  DIGITAL FIR & CITIZEN SAFETY PORTAL
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              title="Return to Home Page"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '0.05em',
                color: '#00d9ff',
                background: 'rgba(10,18,35,0.78)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 0 10px rgba(0, 217, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.2)';
                e.currentTarget.style.borderColor = '#00d9ff';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 217, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#00d9ff';
                e.currentTarget.style.backgroundColor = 'rgba(10,18,35,0.78)';
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 217, 255, 0.1)';
              }}
            >
              ← BACK TO HOME
            </button>
            <p style={{fontSize:'9px',color:'#9AA4B2',margin:'6px 0 0 0',lineHeight:1.5}}>
              Empowering citizens. Strengthening safety.<br/>Building a secure India.
            </p>
          </div>

          {/* Citizen Services */}
          <div style={{...glass, padding:'12px'}}>
            <div style={{fontSize:'9px',color:'#00D9FF',fontWeight:'800',letterSpacing:'0.1em',
              textTransform:'uppercase',marginBottom:'8px',display:'flex',alignItems:'center',gap:'5px'}}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#00D9FF',display:'inline-block'}}/>
              CITIZEN SERVICES
            </div>
            {[
              {icon:'📄', title:'Register FIR Online',    desc:'File digital complaints anytime, anywhere'},
              {icon:'🔍', title:'Track FIR Status',       desc:'Real-time updates on your case'},
              {icon:'📤', title:'Upload Evidence',        desc:'Securely upload documents & media'},
              {icon:'📍', title:'Select Police Station',  desc:'Choose nearest police station'},
              {icon:'📧', title:'Email Notifications',    desc:'Receive updates on your registered email'},
              {icon:'🛟', title:'24×7 Citizen Support',   desc:'We are here to help you always'},
            ].map((s,i) => (
              <div key={i} className="svc-row" style={{display:'flex',gap:'7px',alignItems:'flex-start',padding:'4px 0',cursor:'pointer'}}>
                <span style={{fontSize:'13px',flexShrink:0,marginTop:'1px'}}>{s.icon}</span>
                <div>
                  <div style={{fontSize:'9.5px',fontWeight:'700',color:'#E2E8F0'}}>{s.title}</div>
                  <div style={{fontSize:'8px',color:'#9AA4B2',marginTop:'1px'}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Platform Stats */}
          <div style={{...glass, padding:'12px'}}>
            <div style={{fontSize:'9px',color:'#00D9FF',fontWeight:'800',letterSpacing:'0.1em',
              textTransform:'uppercase',marginBottom:'8px',display:'flex',alignItems:'center',gap:'5px'}}>
              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#00D9FF',display:'inline-block'}}/>
              LIVE PLATFORM STATS
            </div>
            {[
              {label:'FIR Registered Today',      val:'124',    color:'#FFFFFF'},
              {label:'Cases Under Investigation',  val:'842',    color:'#FFFFFF'},
              {label:'Connected Police Stations',  val:'39',     color:'#FFFFFF'},
              {label:'Email Notification System',  val:'ACTIVE', color:'#00D9FF', glow:true},
              {label:'Citizen Support Status',     val:'24×7',   color:'#00D9FF'},
            ].map((s,i) => (
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'3px 0',
                borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span style={{fontSize:'8.5px',color:'#9AA4B2'}}>{s.label}</span>
                <span style={{fontSize:'9.5px',fontWeight:'800',color:s.color,fontFamily:'monospace',
                  textShadow:s.glow?'0 0 8px rgba(0,217,255,0.6)':'none'}}>
                  <Counter target={s.val}/>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════ CENTER — LOGIN CARD ══════ */}
        <div style={{flex:'0 0 500px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <div className="login-card" style={{
            width:'500px', padding:'44px 46px',
            borderRadius:'22px',
            background:'rgba(8,16,32,0.92)',
            border:'1px solid rgba(0,217,255,0.28)',
            backdropFilter:'blur(20px)',
            boxShadow:'0 0 50px rgba(0,217,255,0.22), inset 0 0 25px rgba(0,217,255,0.06)',
            transition:'box-shadow .3s',
          }}>
            <div style={{textAlign:'center',marginBottom:'30px'}}>
              <div style={{fontSize:'11.5px',color:'#9AA4B2',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>WELCOME TO</div>
              <h2 style={{margin:0,fontSize:'26px',fontWeight:'900',letterSpacing:'-0.01em'}}>
                CrimePilot <span style={{color:'#00D9FF'}}>AI</span>
              </h2>
              <div style={{fontSize:'11px',color:'#00D9FF',fontWeight:'800',letterSpacing:'0.08em',
                textTransform:'uppercase',marginTop:'6px'}}>
                DIGITAL FIR & CITIZEN SAFETY PORTAL
              </div>
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,0.12)',borderLeft:'3px solid #ef4444',
                padding:'10px 12px',borderRadius:'6px',fontSize:'11px',color:'#fca5a5',marginBottom:'16px'}}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div>
                <label style={label}>EMAIL OR MOBILE NUMBER</label>
                <input
                  type="text"
                  className="cp-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter registered email or mobile"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={label}>PASSWORD</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="cp-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{ ...inputStyle, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseEnter={() => setIsEyeHovered(true)}
                    onMouseLeave={() => setIsEyeHovered(false)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                    aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      margin: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isEyeHovered ? '#00D9FF' : '#8AA3B5',
                      filter: isEyeHovered ? 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.5))' : 'none',
                      transition: 'all 200ms ease',
                      outline: 'none'
                    }}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <Link to="/citizen/forgot-password" style={{ color: '#00D9FF', fontSize: '12px', fontWeight: '700', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  padding: '15px',
                  background: 'linear-gradient(90deg,#00B8D9,#00D9FF)',
                  color: '#060D1A',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '15px',
                  letterSpacing: '0.03em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 20px rgba(0,217,255,0.3)',
                }}
              >
                {loading ? 'Authorizing...' : 'Secure Citizen Authorization'}
              </button>
            </form>

            <div style={{textAlign:'center',marginTop:'22px',fontSize:'13.5px',color:'#9AA4B2'}}>
              New to the platform?{' '}
              <Link to="/citizen/register" style={{color:'#00D9FF',textDecoration:'none',fontWeight:'800'}}>
                Register Citizen Account
              </Link>
            </div>

            <div style={{marginTop:'20px',borderTop:'1px solid rgba(255,255,255,0.06)',
              paddingTop:'12px',textAlign:'center',fontSize:'8.5px',color:'#9AA4B2',lineHeight:1.6}}>
              Nodemailer Email OTP Verification • Secure Identity Authorization • Real-Time Case Tracking
            </div>
          </div>
        </div>

        {/* ══════ RIGHT PANEL — ANALYTICS CARDS ══════ */}
        <div style={{width:'200px', flexShrink:0, display:'flex', flexDirection:'column', gap:'10px', alignSelf:'stretch', justifyContent:'center'}}>
          {[
            {label:'FIR REGISTERED TODAY',       val:'124',    extra:<Sparkline/>},
            {label:'CASES UNDER INVESTIGATION',   val:'842',    extra:<BarChart/>},
            {label:'CONNECTED POLICE STATIONS',   val:'39',     extra:<NetworkDots/>},
            {label:'EMAIL NOTIFICATION SYSTEM',   val:'ACTIVE', extra:<Radar/>,  glow:true},
            {label:'CITIZEN SUPPORT',             val:'24×7',   extra:<PulseRings/>, glow:true},
          ].map((c,i) => (
            <div key={i} className="stat-card" style={{
              ...glass, padding:'12px 14px',
              display:'flex', itemsCenter:'center', justifyContent:'space-between',
              gap:'8px', cursor:'pointer', transition:'all .25s',
            }}>
              <div>
                <div style={{fontSize:'7.5px',color:'#9AA4B2',fontWeight:'700',
                  textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'4px'}}>{c.label}</div>
                <div style={{fontSize:c.glow?'14px':'18px',fontWeight:'900',
                  color:c.glow?'#00D9FF':'#FFFFFF',fontFamily:'monospace',
                  textShadow:c.glow?'0 0 10px rgba(0,217,255,0.7)':'none'}}>
                  <Counter target={c.val}/>
                </div>
              </div>
              <div style={{flexShrink:0}}>{c.extra}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════ BOTTOM FOOTER ═══════════════ */}
      <div style={{
        zIndex:1, position:'relative',
        borderTop:'1px solid rgba(255,255,255,0.07)',
        padding:'10px 28px',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        gap:'20px',
      }}>
        {/* Trusted by citizens */}
        <div style={{minWidth:'200px'}}>
          <div style={{fontSize:'8px',color:'#00D9FF',fontWeight:'800',
            textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'8px'}}>TRUSTED BY CITIZENS</div>
          <div style={{display:'flex',gap:'18px'}}>
            {[
              {icon:'🛡️',label:'Secure'},{icon:'🔒',label:'Reliable'},
              {icon:'👁️',label:'Transparent'},{icon:'🎧',label:'24×7 Support'},
            ].map((b,i)=>(
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
                <div style={{fontSize:'18px'}}>{b.icon}</div>
                <span style={{fontSize:'7.5px',color:'#9AA4B2'}}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div style={{maxWidth:'340px',textAlign:'center'}}>
          <div style={{fontSize:'8px',color:'#00D9FF',fontWeight:'800',textTransform:'uppercase',
            letterSpacing:'0.1em',marginBottom:'5px',display:'flex',alignItems:'center',
            justifyContent:'center',gap:'5px'}}>
            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#00D9FF',display:'inline-block'}}/>
            OUR MISSION
          </div>
          <p style={{margin:0,fontSize:'8.5px',color:'#9AA4B2',lineHeight:1.5}}>
            To provide a seamless digital platform for citizens to report incidents,
            track cases and connect with the police department efficiently.
          </p>
        </div>

        {/* Stay Safe, Stay Connected */}
        <div style={{minWidth:'220px',textAlign:'right'}}>
          <div style={{fontSize:'8px',color:'#00D9FF',fontWeight:'800',textTransform:'uppercase',
            letterSpacing:'0.1em',marginBottom:'5px'}}>STAY SAFE, STAY CONNECTED</div>
          <p style={{margin:'0 0 6px 0',fontSize:'8.5px',color:'#9AA4B2',lineHeight:1.5}}>
            CrimePilot AI is committed to building a safer tomorrow through technology and trust.
          </p>
          <div style={{display:'flex',alignItems:'center',gap:'5px',justifyContent:'flex-end'}}>
            <span style={{fontSize:'10px'}}>🔒</span>
            <span style={{fontSize:'8px',color:'#00D9FF',fontWeight:'800'}}>SECURE CONNECTION</span>
          </div>
          <div style={{fontSize:'8px',color:'#9AA4B2'}}>256-bit SSL Encryption</div>
        </div>
      </div>

      {/* ═══════════════ STATUS BAR ═══════════════ */}
      <div style={{
        zIndex:1, position:'relative',
        height:'28px', background:'rgba(4,10,22,0.95)',
        borderTop:'1px solid rgba(0,217,255,0.1)',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'50px',
      }}>
        {[
          {color:'#00D9FF',label:'LIVE FEED'},
          {color:'#00D9FF',label:'GEO TRACKING'},
          {color:'#a855f7',label:'AI ANALYSIS'},
          {color:'#00D9FF',label:'SECURE CONNECTION'},
        ].map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:s.color,
              boxShadow:`0 0 6px ${s.color}`,display:'inline-block'}}/>
            <span style={{fontSize:'8.5px',color:s.color === '#a855f7'?'#a855f7':'#9AA4B2',
              fontWeight:'700',letterSpacing:'0.1em'}}>{s.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .cp-input:focus { border-color:#00D9FF !important; box-shadow:0 0 0 2px rgba(0,217,255,0.12); }
        .login-card:hover { box-shadow:0 0 60px rgba(0,217,255,0.28), inset 0 0 20px rgba(0,217,255,0.06) !important; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 0 20px rgba(0,217,255,0.2); border-color:rgba(0,217,255,0.35) !important; }
        .svc-row:hover { background:rgba(0,217,255,0.04); border-radius:6px; }
        @media(max-width:1100px){
          .left-col,.right-col{ display:none!important; }
        }
        @media(max-height:700px){
          .footer-row{ display:none!important; }
        }
      `}</style>
    </div>
  );
}
