'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gift,
  Headphones,
  Home as HomeIcon,
  Menu,
  MessageCircle,
  Percent,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Trophy,
  UserRound,
  WalletCards,
  X,
  Zap,
} from 'lucide-react';

const games = [
  { name: 'KoolBet', tone: 'sky', mark: 'K', title: 'KOOLBET', type: 'SPORTS' },
  { name: 'INOUT', tone: 'gold', mark: 'IN', title: 'IN OUT', type: 'LIVE' },
  { name: 'JILI', tone: 'coral', mark: 'J', title: 'JILI', type: 'SLOTS' },
  { name: 'Evolution Gaming', tone: 'blue', mark: 'E', title: 'EVOLUTION', type: 'LIVE' },
  { name: 'PG Soft', tone: 'pink', mark: 'PG', title: 'PG SOFT', type: 'SLOTS' },
  { name: '9wicket', tone: 'green', mark: '9', title: '9 WICKETS', type: 'SPORTS' },
  { name: 'Aviator', tone: 'red', mark: 'A', title: 'AVIATOR', type: 'CRASH' },
  { name: 'aviator', tone: 'orange', mark: 'AV', title: 'AVIATOR', type: 'CRASH' },
  { name: 'Chicken Road 2', tone: 'yellow', mark: 'CR', title: 'CHICKEN ROAD', type: 'ARCADE' },
];

const activities = [
  ['Refer a friend and earn Rs 588', 'Invite Treasure Box', 'refer'],
  ['First deposit get a 30% bonus', 'New Register Can Get Bonus', 'deposit'],
  ['Rs 1,888,888 reward pool', 'Play, win and collect rewards', 'reward'],
  ['Lucky reload bonus', 'Reload now and claim rewards', 'reload'],
];

function Logo() {
  return (
    <div className="brand-mark" aria-label="81CC">
      <span className="brand-orb">81</span>
      <strong>81CC</strong><em>.com</em>
    </div>
  );
}

function PromoStrip() {
  return (
    <div className="promo-stack">
      <div className="jackpot-banner"><span>Rs 1,000,000+</span><small>Daily Jackpot</small><b>1 2 3</b></div>
      <div className="mini-promos">
        <div className="mini-promo pink"><b>RECEIVE FOR FREE</b><strong>Rs 1,500</strong><small>REGISTER NOW</small></div>
        <div className="mini-promo blue"><b>SLOTS &amp; BLOCKCHAIN</b><strong>1,000,000+</strong><small>LEADERBOARD DAILY</small></div>
        <div className="mini-promo green"><b>INVITE A FRIEND</b><strong>Rs 588</strong><small>INVITE NOW</small></div>
      </div>
      <div className="ticker"><MessageCircle size={16} fill="currentColor" /> <span>39] successfully withdrew Rs12,100.00 !!</span><span className="ticker-arrows">◆ ◆</span></div>
    </div>
  );
}

function GameCard({ game, onPage }) {
  return (
    <button className={`game-card ${game.tone}`} onClick={() => onPage('games')}>
      <div className="game-art"><span className="game-glow">{game.mark}</span><i>{game.type}</i><div className="art-spark">✦</div></div>
      <span>{game.name}</span>
    </button>
  );
}

function SideNav({ active, onChange }) {
  const items = [['hot', 'HOT', '♨'], ['sports', 'SPORT', '◉'], ['blockchain', 'BLOCKCHAIN', '⌘'], ['poker', 'POKER', '♤'], ['casino', 'CASINO', '⚄']];
  return <div className="side-nav">{items.map(([id, label, icon]) => <button key={id} className={active === id ? 'selected' : ''} onClick={() => onChange(id)}><span>{icon}</span><b>{label}</b></button>)}</div>;
}

function AccountRow({ onLogin, onRegister, onPage }) {
  return <div className="account-row">
    <div className="account-actions"><button className="login-btn" onClick={onLogin}>Log in</button><button className="register-btn" onClick={onRegister}>Register</button></div>
    <div className="quick-actions"><button onClick={() => onPage('deposit')}><Gift size={24} /><small>Deposit</small></button><button onClick={() => onPage('withdraw')}><WalletCards size={24} /><small>Withdraw</small></button><button onClick={() => onPage('service-mail')}><MessageCircle size={24} /><small>Mail</small></button></div>
  </div>;
}

function BottomNav({ onPage }) {
  return <div className="bottom-nav">
    <button onClick={() => onPage('home')}><HomeIcon /><b>HOME</b></button>
    <button onClick={() => onPage('promo')}><Percent /><b>PROMO</b></button>
    <button className="bonus" onClick={() => onPage('bonus')}><div><Sparkles size={25} /><span>Get 1500</span></div></button>
    <button onClick={() => onPage('vip')}><Trophy /><b>EARN</b></button>
    <button onClick={() => onPage('vip')}><UserRound /><b>MINE</b></button>
  </div>;
}

function AuthModal({ mode, onClose, onMode }) {
  const [showPassword, setShowPassword] = useState(false);
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="auth-modal" onMouseDown={(event) => event.stopPropagation()}>
      <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => onMode('login')}>Login</button><button className={mode === 'register' ? 'active' : ''} onClick={() => onMode('register')}>Register</button><button className="close-modal" onClick={onClose}><X size={30} /></button></div>
      <div className="field phone"><span>▣</span><b>+92</b><i></i><input placeholder="Mobile number" /></div>
      <div className="field"><ShieldCheck size={24} /><input type={showPassword ? 'text' : 'password'} placeholder="Password" /><button onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
      {mode === 'register' && <><div className="field"><ShieldCheck size={24} /><input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" /><button onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div><button className="invite-toggle">Invite code (Optional) <ChevronRight size={18} /></button><label className="agree"><input type="checkbox" defaultChecked /> <span>I have read and agree</span> <a>Privacy Agreement</a></label></>}
      <button className="submit-auth">{mode === 'login' ? 'Login' : 'Register'}</button>
      <div className="quick-login"><span>Quick Login</span><button className="google">G</button></div>
      <div className="language"><span className="pak-flag">◐</span> EN</div>
    </div>
  </div>;
}

function HomePage({ onAuth, onPage }) {
  const [category, setCategory] = useState('hot');
  return <div className="phone-shell home-shell">
    <header className="topbar"><Logo /><div className="top-links"><button onClick={() => onPage('service')}><Headphones /><span>Live Chat 24/7</span></button><button onClick={() => onPage('roulette')}><Sparkles /><span>Lucky wheel</span></button><button onClick={() => onPage('bonus')}><Gift /><span>Bonus</span></button></div></header>
    <PromoStrip />
    <AccountRow onLogin={() => onAuth('login')} onRegister={() => onAuth('register')} onPage={onPage} />
    <main className="game-area"><SideNav active={category} onChange={setCategory} /><div className="games-grid">{games.map((game) => <GameCard game={game} onPage={onPage} key={game.name} />)}</div></main>
    <BottomNav onPage={onPage} />
  </div>;
}

function PageHeader({ title, onBack, tabs, active, setActive }) {
  return <div className="sub-header"><button onClick={onBack}><ArrowLeft /></button>{tabs ? tabs.map((tab) => <button key={tab} className={active === tab ? 'active' : ''} onClick={() => setActive(tab)}>{tab}</button>) : <strong>{title}</strong>}</div>;
}

function ActivityPage({ onBack }) {
  return <div className="phone-shell inner-shell"><PageHeader onBack={onBack} tabs={['Activity', 'Unclaimed']} active="Activity" setActive={() => {}} /><div className="activity-list">{activities.map(([title, label, tone]) => <article className={`activity-card ${tone}`} key={label}><div className="activity-art"><span>81CC</span><strong>{title}</strong><i>{tone === 'refer' ? 'Rs 588' : tone === 'deposit' ? '30% BONUS' : tone === 'reward' ? 'Rs 1,888,888' : 'RELOAD NOW'}</i></div><h3>{label}</h3></article>)}</div><BottomNav onPage={() => {}} /></div>;
}

function EarnPage({ onBack, onPage }) {
  const [tab, setTab] = useState('My Rewards');
  return <div className="phone-shell inner-shell"><PageHeader onBack={onBack} tabs={['My Rewards', 'Invite Rewards', 'Rules']} active={tab} setActive={setTab} />{tab === 'Rules' ? <div className="rules"><div className="rules-hero"><Sparkles size={42} /><strong>81CC.COM</strong><b>RS 8,000,000</b><span>IN 3 EASY STEPS</span></div><div className="agent-tree">AGENCY COOPERATION DETAILS<div className="tree-line">YOU</div><div className="tree-nodes"><span>A1</span><span>A2</span></div><small>A → YOU: A is your LV1 agent<br />B → YOU: B is your LV2 agent</small></div></div> : <div className="rewards"><section className="team-card"><div className="ribbon">My Team Club</div><h2>Club Stars <span>★</span><button>?</button></h2><div className="progress-line">Club member <b>(0/5)</b></div><div className="progress-line">Club bet <b>(0 / 100k)</b></div><hr /><h2>My Rebate:</h2><div className="rebate-grid"><div>♨<small>Bet Rebate Up To<br /><b>0.37 %</b></small></div><div>✦<small>Deposit Rebate <b>4%</b></small></div><div>♨<small>Invite Rewards Up<br /><b>To 8800</b></small></div></div></section><section className="withdraw-card"><span>Withdrawable</span><strong>0</strong><button>Claim</button><button>Detail</button></section><section className="totals"><div>Total Rewards<strong>0</strong></div><div>Today's Rewards<strong>0</strong></div></section><section className="invite-card"><div><b>Invite friends</b><a>My invitation code <Copy size={16} /></a></div><div className="qr-placeholder">▦</div><div><a>My invitation link</a><p>https://81cc2.com/#/register?referCode...</p></div><div className="share-row"><button>↗</button><button>f</button><button>◉</button><button>➤</button></div></section><button className="ranking-link" onClick={() => onPage('ranking')}>Open ranking</button></div>}<BottomNav onPage={onPage} /></div>;
}

function ServicePage({ onBack }) {
  const [tab, setTab] = useState('Service center');
  const faqs = ['Become an Agent & Earn', 'How You Earn Profit', 'Deposit Not Received?', 'How to Withdraw?'];
  return <div className="phone-shell service-shell"><div className="service-title"><button onClick={onBack}><ArrowLeft /></button><strong>Message Center</strong></div><PageHeader onBack={onBack} tabs={['Service center', 'Mail', 'Feedback']} active={tab} setActive={setTab} /><div className="service-content">{tab === 'Mail' ? <MailView /> : <><section className="support-card"><div className="support-avatar">24</div><div><h2>24/7 Customer Support</h2><p>If you encounter any problems in the game, please contact our customer service</p><button>Contact Now</button></div></section><section className="help-card"><h2><MessageCircle /> Other Help Center</h2>{[['WhatsApp official', 'Follow 81CC on WhatsApp for daily bonuses, latest updates, and exclusive rewards!', 'whatsapp'], ['Facebook Official', 'Follow 81CC on Facebook for daily bonuses, latest updates, and exclusive rewards!', 'facebook'], ['Telegram official', 'Follow 81CC on Telegram for daily bonuses, latest updates, and exclusive rewards!', 'telegram']].map(([title, text, tone]) => <div className={`help-row ${tone}`} key={title}><span>{tone === 'facebook' ? 'f' : tone === 'telegram' ? '➤' : '◉'}</span><div><b>{title}</b><p>{text}</p></div><button>Contact Now</button></div>)}</section><section className="faq-card"><h2>FAQ</h2>{faqs.map((faq) => <button key={faq}><span>▣</span>{faq}<ChevronRight /></button>)}</section></>}</div></div>;
}

function MailView() {
  return <div className="mail-view"><div className="mail-tabs"><b>Notification</b><b>Gift</b></div><article className="mail-item"><span>▣</span><div><strong>♛ VIP Offer — Deposit Par 30% Extr...</strong><small>◷ &nbsp; 2026-10-18 18:25</small></div></article><div className="mail-actions"><button>Delete read</button><button>Receive all</button></div></div>;
}

function DepositPage({ onBack }) {
  const [method, setMethod] = useState('Crypto');
  const [channel, setChannel] = useState('USDT-TRC-20');
  return <div className="phone-shell finance-shell deposit-shell"><PageHeader onBack={onBack} title="Deposit" /><div className="finance-content"><h3>Payment Methods <sup>*</sup></h3><div className="method-grid">{[['Crypto', '₮', '+2%'], ['JazzCash', 'J', '+700'], ['Easypaisa', 'e', '+700']].map(([name, icon, badge]) => <button key={name} className={method === name ? 'selected' : ''} onClick={() => setMethod(name)}><span>{icon}</span><b>{name}</b><i>{badge}</i></button>)}</div><h3>Select channel <sup>*</sup></h3><div className="channel-row">{['USDT-TRC-20', 'USDT-ERC-20'].map((item) => <button key={item} className={channel === item ? 'selected' : ''} onClick={() => setChannel(item)}>{item}</button>)}</div><section className="amount-panel"><h3>Deposit Amount <small>Min: 1 Max: 100000</small></h3><div className="amount-input"><span>▰</span><input defaultValue="5000" /><b>Rs</b></div><div className="rate-row"><b>Exchange rate</b> 1:276.47 <strong>Amount received≈1382350</strong></div><h3>Deposit Event* <small className="timer">⚡ 05:25:34</small></h3><button className="event-choice">New Register Can Get Bonus</button><h3>Deposit Offer Voucher</h3><div className="voucher">GO COLLECT NOW <b>+</b></div><h4>Recharge Instructions</h4><p>81cc.com ke recharge orders 1–3 minutes mein process ho jate hain.</p></section><button className="finance-submit">Deposit</button></div></div>;
}

function WithdrawPage({ onBack }) {
  const [method, setMethod] = useState('Crypto');
  return <div className="phone-shell finance-shell withdraw-shell"><PageHeader onBack={onBack} title="Withdraw" /><div className="withdraw-content"><div className="balance-grid"><div>Cash Balance<strong>0 <small>3S</small></strong></div><div>Available<strong>0 <small>3S</small></strong></div></div><div className="withdraw-tabs"><button>Normal withdrawal</button><button>Withdraw to<br />deposit</button></div><div className="withdraw-methods">{[['Crypto', '₮'], ['Easypaisa', 'e'], ['JazzCash', 'J'], ['Bank', '▣']].map(([name, icon]) => <button key={name} className={method === name ? 'selected' : ''} onClick={() => setMethod(name)}><span>{icon}</span><b>{name}</b></button>)}</div><button className="add-address">▣ Add address</button><h3>Withdrawal Amount <sup>*</sup> <small>Min: 100 Max: 50,000</small></h3><div className="withdraw-input">Add a withdrawal account before withdrawing</div><ul className="withdraw-rules"><li>You still need 0 valid bets to withdraw money!</li><li>Withdraw time 00:00-23:59</li><li>Inday Remaining Withdrawal Times: 15</li><li>Withdrawal amount range: 100-50,000</li></ul></div><button className="withdraw-submit">Withdraw</button></div>;
}

function WithdrawalHistory({ onBack }) {
  return <div className="phone-shell history-shell"><PageHeader onBack={onBack} title="Withdrawal history" /><div className="history-tabs"><button>1 Days</button><button>7 Days</button><button>30 Days</button><p>18/10/2026 to 18/10/2026 <span>Total: 0</span></p></div><div className="empty-history"><span>▱</span><p>It is empty here</p></div></div>;
}

function GamesPage({ onBack }) {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const gameList = [...games, { name: 'Dragon Tiger', tone: 'blue', mark: 'DT', type: 'CASINO' }, { name: 'Money Coming', tone: 'gold', mark: '$', type: 'SLOTS' }, { name: 'Teen Patti', tone: 'red', mark: 'TP', type: 'CARD' }];
  return <div className="phone-shell games-shell"><div className="games-title"><button onClick={onBack}><ArrowLeft /></button><strong>KoolBet</strong><label><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />⌕</label></div><div className="games-tabs">{['All', 'Hot', 'Recent'].map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><div className="games-browser"><div className="provider-list">{['KoolBet', 'INOUT', 'SPRIBE', 'JILI', '2J Games', 'FC', 'JDB'].map((provider) => <button key={provider}>{provider}</button>)}</div><div className="browser-grid">{gameList.filter((game) => game.name.toLowerCase().includes(search.toLowerCase())).map((game) => <GameCard game={game} onPage={() => {}} key={game.name} />)}</div></div></div>;
}

function RoulettePage({ onBack }) {
  return <div className="phone-shell roulette-shell"><div className="roulette-top"><button onClick={onBack}><ArrowLeft /></button><span>♬ &nbsp; ****7629 successfully withdrawn money!</span><b>◉ 0</b></div><div className="roulette-hero"><button>Rule</button><button>Record</button><h1>Deposit spinner<br />rewards up to 3,779</h1><button className="deposit-now">Deposit now</button></div><div className="reward-levels">{['most 399', 'most 799', 'most 1,999', 'most 3,779'].map((item) => <div key={item}>◎<span>{item}</span></div>)}</div><p className="spin-copy">Deposit 500 to get 1 spins.</p><div className="spin-track"><i>500<br /><b>+1 Spin</b></i><i>1,500<br /><b>+1 Spin</b></i></div><div className="wheel"><div className="wheel-center">GO<br /><span>Spin*0</span></div><div className="wheel-labels"><span>Free Spin*2</span><span>399</span><span>79</span><span>299</span><span>Free Spin*1</span><span>39</span><span>69</span><span>199</span></div></div></div>;
}

function BonusModal({ onClose }) {
  return <div className="bonus-backdrop" onMouseDown={onClose}><div className="bonus-modal" onMouseDown={(event) => event.stopPropagation()}><div className="bonus-ribbon">Available Bonus</div>{[['Invite Turntable', '1,500'], ['Mail', 'GO'], ['Super Member Day', 'GO'], ['Invitation Rewards', 'GO'], ['First deposit', 'GO']].map(([title, value], index) => <div className="bonus-row" key={title}><b>{title}</b><button>{value}</button>{index === 2 && <small>4Day 05:36:01</small>}</div>)}<button className="bonus-close" onClick={onClose}><X /></button></div></div>;
}

function VipPage({ onBack, onPage }) {
  return <div className="phone-shell vip-shell"><PageHeader onBack={onBack} title="VIP" /><div className="vip-heading"><div className="vip-avatar">VIP</div><b>⌄ UID 184034910</b><span>0<sup>1TM</sup></span></div><section className="vip-level"><div className="crown">♛</div><strong>VIP 1</strong><div><small>next level</small><b>0/100</b><hr /><small>Accumulated deposits</small><b>0/500</b><hr /><small>Accumulated bets</small></div></section><div className="vip-grid">{[['Level up rewards', '1.5'], ['Weekly reward', '1.1'], ['Monthly reward', '1.9'], ['Rebate Rate', '0.15%']].map(([name, value]) => <div key={name}><span>▣</span><b>{name}</b><strong>{value}</strong><button>▣</button></div>)}</div><section className="vip-table"><h2>Accumulated monthly deposits increase VIP level</h2><div className="vip-tabs"><b>VIP privileges</b><b>Weekly reward</b><b>Monthly reward</b></div><div className="vip-table-row"><span>grade</span><span>deposit</span><span>Level up rewards</span><span>Rebate Rate</span></div><div className="vip-table-row"><span>1</span><span>100</span><span>1.5</span><span>0.15%</span></div></section><button className="ranking-link" onClick={() => onPage('ranking')}>View ranking</button></div>;
}

function RankingPage({ onBack }) {
  const people = ['****5277', '****7442', '****3385', '****4073', '****7952', '****9867'];
  return <div className="phone-shell ranking-shell"><PageHeader onBack={onBack} tabs={['Ranking', 'Rules', 'My rewards']} active="Ranking" setActive={() => {}} /><div className="ranking-hero"><div className="ranking-tabs"><span>Daily</span><span>Weekly</span><span>Monthly</span></div><strong>JACKPOT</strong><b>22,487.73</b><small>ⓘ 1.4% of total bets by all 81CC.COM players.</small><div className="podium"><div>♛<b>****7442</b><small>Reward: 6%</small></div><div>♛<b>****5277</b><small>Reward: 9.5%</small></div><div>♛<b>****3385</b><small>Reward: 4.5%</small></div></div></div><div className="ranking-list">{people.slice(3).map((person, index) => <div key={person}><strong>{index + 4}</strong><span className="person-avatar">{index + 4}</span><b>{person}<small>Reward {2.94 - index * .3}%</small></b><em>Total Bets<br />598,684.46</em></div>)}</div><div className="rank-footer"><b>No rank</b><span>No Bets <strong>0</strong><br />My rewards <strong>0 %</strong></span><span>Ranks left<br /><strong>228,268.02</strong></span></div></div>;
}

export default function Home() {
  const [page, setPage] = useState('home');
  const [auth, setAuth] = useState(null);
  return <div className="app-background">{page === 'home' && <HomePage onAuth={setAuth} onPage={setPage} />}{page === 'promo' && <ActivityPage onBack={() => setPage('home')} />}{page === 'earn' && <EarnPage onBack={() => setPage('home')} onPage={setPage} />}{page === 'mine' && <VipPage onBack={() => setPage('home')} onPage={setPage} />}{page === 'service' && <ServicePage onBack={() => setPage('home')} />}{page === 'service-mail' && <ServicePage onBack={() => setPage('home')} />}{page === 'roulette' && <RoulettePage onBack={() => setPage('home')} />}{page === 'deposit' && <DepositPage onBack={() => setPage('home')} />}{page === 'withdraw' && <WithdrawPage onBack={() => setPage('home')} />}{page === 'withdraw-history' && <WithdrawalHistory onBack={() => setPage('home')} />}{page === 'games' && <GamesPage onBack={() => setPage('home')} />}{page === 'vip' && <VipPage onBack={() => setPage('home')} onPage={setPage} />}{page === 'ranking' && <RankingPage onBack={() => setPage('home')} />}{auth && <AuthModal mode={auth} onClose={() => setAuth(null)} onMode={setAuth} />}{page === 'bonus' && <><HomePage onAuth={setAuth} onPage={setPage} /><BonusModal onClose={() => setPage('home')} /></>}</div>;
}
