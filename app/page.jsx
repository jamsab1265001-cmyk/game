'use client';

import { useState, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
      <span className="brand-orb">Jam</span>
      <strong>Jam</strong><em>.com</em>
    </div>
  );
}


function PromoStrip() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnnouncements() {
      try {
        const response = await fetch(`${API}/api/announcements`, {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) return;

        const data = await response.json();
        setAnnouncements(data.announcements || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load announcements");
        }
      }
    }

    loadAnnouncements();

    return () => controller.abort();
  }, []);

  const messages = announcements.map((item) => item.message);
  const tickerText = messages.join("     ◆     ");

  return (
    <div className="promo-stack">
      <div className="jackpot-banner">
        <span>Rs 1,000,000+</span>
        <small>Daily Jackpot</small>
        <b>1 2 3</b>
      </div>

      <div className="mini-promos">
        <div className="mini-promo pink">
          <b>RECEIVE FOR FREE</b>
          <strong>Rs 1,500</strong>
          <small>REGISTER NOW</small>
        </div>

        <div className="mini-promo blue">
          <b>SLOTS &amp; BLOCKCHAIN</b>
          <strong>1,000,000+</strong>
          <small>LEADERBOARD DAILY</small>
        </div>

        <div className="mini-promo green">
          <b>INVITE A FRIEND</b>
          <strong>Rs 588</strong>
          <small>INVITE NOW</small>
        </div>
      </div>

      <div className="ticker announcement-ticker">
        <MessageCircle
          size={16}
          fill="currentColor"
          className="announcement-icon"
        />

        <div className="announcement-window">
          {messages.length > 0 ? (
            <div className="announcement-moving" key={tickerText}>
              <span>{tickerText}</span>
            </div>
          ) : (
            <span className="announcement-empty">
              Welcome! Stay tuned for updates.
            </span>
          )}
        </div>

        <span className="ticker-arrows">◆ ◆</span>
      </div>
    </div>
  );
}



function GameCard({ game, onPage }) {
  if (game.type === "category") {
    return (
      <button
        type="button"
        className="game-card category-banner-card"
        onClick={() => {
          if (game.linkedCategory?._id) {
            onPage("category", game.linkedCategory._id);
          }
        }}
      >
        <img
          src={game.image?.url}
          alt={game.name}
          className="category-banner-image"
        />
      </button>
    );
  }

  return (
    <a
      className="game-card"
      href={game.gameUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="game-art">
        <img
          src={game.image?.url}
          alt={game.name}
          loading="lazy"
          className="dynamic-game-image"
        />
      </div>
      <span>{game.name}</span>
    </a>
  );
}




function SideNav({ categories, active, onChange }) {
  return (
    <div className="side-nav">
      {categories.map((category) => (
        <button
          key={category._id}
          className={active === category._id ? 'selected' : ''}
          onClick={() => onChange(category._id)}
        >
          {category.icon?.url && (
            <img
              src={category.icon.url}
              alt=""
              className="dynamic-category-icon"
            />
          )}
          <b>{category.name}</b>
        </button>
      ))}
    </div>
  );
}



function AccountRow({ onLogin, onRegister, onPage }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("userToken");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <div className="account-row">
      {user ? (
        <div
          className="user-profile"
          role="button"
          tabIndex={0}
          onClick={() => onPage("vip")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onPage("vip");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="user-avatar">👤</div>

          <div className="user-details">
            <div className="user-uid">
              UID {user.id?.slice(-8).toUpperCase()}
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(user.id)}
                title="Copy UID"
              >
                <Copy size={13} />
              </button>
            </div>

            <div className="user-balance">
              <span>Rs</span>
              <strong>0.00</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="account-actions">
          <button className="login-btn" onClick={onLogin}>
            Log in
          </button>
          <button className="register-btn" onClick={onRegister}>
            Register
          </button>
        </div>
      )}

      <div className="quick-actions">
        <button onClick={() => onPage("deposit")}>
          <Gift size={24} />
          <small>Deposit</small>
        </button>

        <button onClick={() => onPage("withdraw")}>
          <WalletCards size={24} />
          <small>Withdraw</small>
        </button>

        <button onClick={() => onPage("service-mail")}>
          <MessageCircle size={24} />
          <small>Mail</small>
        </button>
      </div>
    </div>
  );
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
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (mode === "register" && !agree) {
      setError("Please accept the Privacy Agreement");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          password,
          ...(mode === "register" ? { inviteCode } : {})
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      localStorage.setItem("userToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="auth-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setError(""); onMode("login"); }}>Login</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setError(""); onMode("register"); }}>Register</button>
          <button type="button" className="close-modal" onClick={onClose}><X size={30} /></button>
        </div>

        {error && <p role="alert" style={{ color: "#ff6b6b", padding: "8px 15px" }}>{error}</p>}

        <div className="field phone">
          <span>▣</span><b>+92</b><i></i>
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="Mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="field">
          <ShieldCheck size={24} />
          <input
            required
            minLength={6}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {mode === "register" && (
          <>
            <div className="field">
              <ShieldCheck size={24} />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="button" className="invite-toggle" onClick={() => setShowInvite(!showInvite)}>
              Invite code (Optional) <ChevronRight size={18} />
            </button>

            {showInvite && (
              <div className="field">
                <input
                  placeholder="Invite code"
                  maxLength={50}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>
            )}

            <label className="agree">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I have read and agree</span> <span>Privacy Agreement</span>
            </label>
          </>
        )}

        <button type="submit" className="submit-auth" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <div className="language"><span className="pak-flag">◐</span> EN</div>
      </form>
    </div>
  );
}



function HomePage({ onAuth, onPage }) {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [visibleCount, setVisibleCount] = useState(18);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const [categoriesRes, gamesRes] = await Promise.all([
          fetch(`${API}/api/categories`, {
            signal: controller.signal,
            cache: "no-store"
          }),
          fetch(`${API}/api/games`, {
            signal: controller.signal,
            cache: "no-store"
          })
        ]);

        if (!categoriesRes.ok || !gamesRes.ok) {
          throw new Error("Failed to load games");
        }

        const [categoryData, gameData] = await Promise.all([
          categoriesRes.json(),
          gamesRes.json()
        ]);

        const loadedCategories = categoryData.categories || [];

        const parents = loadedCategories.filter(
          (item) => item.type === "parent"
        );

        const layoutResults = await Promise.all(
          parents.map(async (parent) => {
            const response = await fetch(
              `${API}/api/layouts/${parent._id}`,
              { signal: controller.signal, cache: "no-store" }
            );

            if (!response.ok) {
              if (response.status === 404) {
                return [parent._id, []];
              }

              throw new Error("Failed to load category layout");
            }

            const data = await response.json();

            return [parent._id, data.items || []];
          })
        );

        setCategories(parents);
        setLayouts(Object.fromEntries(layoutResults));
        setGames(gameData.games || []);
        setCategory(parents[0]?._id || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Unable to load games");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  const visibleGames = layouts[category] || [];
  const displayedItems = visibleGames.slice(0, visibleCount);

  return (
    <div className="phone-shell home-shell">
      <header className="topbar">
        <Logo />
        <div className="top-links">
          <button onClick={() => onPage("service")}>
            <Headphones />
            <span>Live Chat 24/7</span>
          </button>
          <button onClick={() => onPage("roulette")}>
            <Sparkles />
            <span>Lucky wheel</span>
          </button>
          <button onClick={() => onPage("bonus")}>
            <Gift />
            <span>Bonus</span>
          </button>
        </div>
      </header>

      <PromoStrip />

      <AccountRow
        onLogin={() => onAuth("login")}
        onRegister={() => onAuth("register")}
        onPage={onPage}
      />

      <main className="game-area">
        <SideNav
          categories={categories}
          active={category}
          onChange={(id) => {
            setCategory(id);
            setVisibleCount(18);
          }}
        />

        <div className="games-grid">
          {loading && <p>Loading games...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && displayedItems.map((entry) => {
            const item = entry.item;


            if (entry.itemType === "subcategory") {
              const isFullRow = item.displayStyle === "full-row";
              console.log("SUBCATEGORY DEBUG:", item.name, item.displayStyle, isFullRow);
              const imageUrl = item.banner?.url || item.icon?.url;

              return (
                <button
                  key={`subcategory-${item._id}`}
                  type="button"
                  className={
                    isFullRow
                      ? "category-banner-card subcategory-full-banner"
                      : "subcategory-grid-item"
                  }
                  onClick={() => onPage("category", item._id)}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className={
                        isFullRow
                          ? "category-banner-image"
                          : "subcategory-grid-image"
                      }
                    />
                  ) : (
                    <span className="subcategory-placeholder">▣</span>
                  )}

                  {!isFullRow && (
                    <span className="subcategory-grid-name">
                      {item.name}
                    </span>
                  )}
                </button>
              );
            }


            return (
              <div
                key={`game-${item._id}`}
                className={
                  item.displayStyle === "full-row"
                    ? "game-full-row"
                    : "game-single-item"
                }
              >
                <GameCard game={item} onPage={onPage} />
              </div>
            );
          })}

          {!loading && !error && visibleGames.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 18)}
              style={{
                gridColumn: "1 / -1",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #c99736, #f1cc72)",
                color: "#211600",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {visibleGames.length - visibleCount} more game(s)
              <span style={{ color: "#38bdf8", marginLeft: 8 }}>
                Expand ↓
              </span>
            </button>
          )}

          {!loading && !error && !visibleGames.length && (
            <p>No games available.</p>
          )}
        </div>
      </main>

      <BottomNav onPage={onPage} />
    </div>
  );
}


function PageHeader({ title, onBack, tabs, active, setActive }) {
  return <div className="sub-header"><button onClick={onBack}><ArrowLeft /></button>{tabs ? tabs.map((tab) => <button key={tab} className={active === tab ? 'active' : ''} onClick={() => setActive(tab)}>{tab}</button>) : <strong>{title}</strong>}</div>;
}

function ActivityPage({ onBack }) {
  return <div className="phone-shell inner-shell"><PageHeader onBack={onBack} tabs={['Activity', 'Unclaimed']} active="Activity" setActive={() => { }} /><div className="activity-list">{activities.map(([title, label, tone]) => <article className={`activity-card ${tone}`} key={label}><div className="activity-art"><span>81CC</span><strong>{title}</strong><i>{tone === 'refer' ? 'Rs 588' : tone === 'deposit' ? '30% BONUS' : tone === 'reward' ? 'Rs 1,888,888' : 'RELOAD NOW'}</i></div><h3>{label}</h3></article>)}</div><BottomNav onPage={() => { }} /></div>;
}

function EarnPage({ onBack, onPage }) {
  const [tab, setTab] = useState('My Rewards');
  return <div className="phone-shell inner-shell"><PageHeader onBack={onBack} tabs={['My Rewards', 'Invite Rewards', 'Rules']} active={tab} setActive={setTab} />{tab === 'Rules' ? <div className="rules"><div className="rules-hero"><Sparkles size={42} /><strong>81CC.COM</strong><b>RS 8,000,000</b><span>IN 3 EASY STEPS</span></div><div className="agent-tree">AGENCY COOPERATION DETAILS<div className="tree-line">YOU</div><div className="tree-nodes"><span>A1</span><span>A2</span></div><small>A → YOU: A is your LV1 agent<br />B → YOU: B is your LV2 agent</small></div></div> : <div className="rewards"><section className="team-card"><div className="ribbon">My Team Club</div><h2>Club Stars <span>★</span><button>?</button></h2><div className="progress-line">Club member <b>(0/5)</b></div><div className="progress-line">Club bet <b>(0 / 100k)</b></div><hr /><h2>My Rebate:</h2><div className="rebate-grid"><div>♨<small>Bet Rebate Up To<br /><b>0.37 %</b></small></div><div>✦<small>Deposit Rebate <b>4%</b></small></div><div>♨<small>Invite Rewards Up<br /><b>To 8800</b></small></div></div></section><section className="withdraw-card"><span>Withdrawable</span><strong>0</strong><button>Claim</button><button>Detail</button></section><section className="totals"><div>Total Rewards<strong>0</strong></div><div>Today's Rewards<strong>0</strong></div></section><section className="invite-card"><div><b>Invite friends</b><a>My invitation code <Copy size={16} /></a></div><div className="qr-placeholder">▦</div><div><a>My invitation link</a><p>https://81cc2.com/#/register?referCode...</p></div><div className="share-row"><button>↗</button><button>f</button><button>◉</button><button>➤</button></div></section><button className="ranking-link" onClick={() => onPage('ranking')}>Open ranking</button></div>}<BottomNav onPage={onPage} /></div>;
}


function ServicePage({ onBack }) {
  const [tab, setTab] = useState("Service center");
  const [contacts, setContacts] = useState([]);

  const faqs = [
    "Become an Agent & Earn",
    "How You Earn Profit",
    "Deposit Not Received?",
    "How to Withdraw?"
  ];

  const platforms = [
    {
      title: "WhatsApp official",
      text: "Follow 81CC on WhatsApp for daily bonuses, latest updates, and exclusive rewards!",
      tone: "whatsapp",
      icon: "◉"
    },
    {
      title: "Facebook Official",
      text: "Follow 81CC on Facebook for daily bonuses, latest updates, and exclusive rewards!",
      tone: "facebook",
      icon: "f"
    },
    {
      title: "Telegram official",
      text: "Follow 81CC on Telegram for daily bonuses, latest updates, and exclusive rewards!",
      tone: "telegram",
      icon: "➤"
    }
  ];

  useEffect(() => {
    const controller = new AbortController();

    async function loadContacts() {
      try {
        const res = await fetch(`${API}/api/contact-settings`, {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!res.ok) return;

        const data = await res.json();
        setContacts(data.contacts || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to load contact settings");
        }
      }
    }

    loadContacts();

    return () => controller.abort();
  }, []);

  const activePlatforms = platforms
    .map((platform) => ({
      ...platform,
      setting: contacts.find(
        (contact) => contact.platform === platform.tone
      )
    }))
    .filter((platform) => platform.setting?.url);

  return (
    <div className="phone-shell service-shell">
      <div className="service-title">
        <button onClick={onBack}>
          <ArrowLeft />
        </button>
        <strong>Message Center</strong>
      </div>

      <PageHeader
        onBack={onBack}
        tabs={["Service center", "Mail", "Feedback"]}
        active={tab}
        setActive={setTab}
      />

      <div className="service-content">
        {tab === "Mail" ? (
          <MailView />
        ) : (
          <>
            <section className="support-card">
              <div className="support-avatar">24</div>
              <div>
                <h2>24/7 Customer Support</h2>
                <p>
                  If you encounter any problems in the game,
                  please contact our customer service
                </p>
                <button>Contact Now</button>
              </div>
            </section>

            <section className="help-card">
              <h2>
                <MessageCircle /> Other Help Center
              </h2>

              {activePlatforms.map((platform) => (
                <div
                  className={`help-row ${platform.tone}`}
                  key={platform.tone}
                >
                  <span>{platform.icon}</span>

                  <div>
                    <b>{platform.title}</b>
                    <p>{platform.text}</p>
                  </div>

                  <a
                    href={platform.setting.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link-btn"
                  >
                    {platform.setting.buttonText || "Contact Now"}
                  </a>
                </div>
              ))}
            </section>

            <section className="faq-card">
              <h2>FAQ</h2>

              {faqs.map((faq) => (
                <button key={faq}>
                  <span>▣</span>
                  {faq}
                  <ChevronRight />
                </button>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}


function MailView() {
  return <div className="mail-view"><div className="mail-tabs"><b>Notification</b><b>Gift</b></div><article className="mail-item"><span>▣</span><div><strong>♛ VIP Offer — Deposit Par 30% Extr...</strong><small>◷ &nbsp; 2026-10-18 18:25</small></div></article><div className="mail-actions"><button>Delete read</button><button>Receive all</button></div></div>;
}


function DepositPage({ onBack }) {
  const [settings, setSettings] = useState([]);
  const [method, setMethod] = useState("");
  const [channel, setChannel] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const res = await fetch(`${API}/api/deposit-settings`, {
          signal: controller.signal,
          cache: "no-store"
        });

        if (!res.ok) throw new Error("Unable to load payment methods");

        const data = await res.json();
        const list = data.settings || [];

        setSettings(list);

        if (list.length) {
          setMethod(list[0].method);
          setChannel(list[0]._id);
        }
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadSettings();
    return () => controller.abort();
  }, []);

  const methods = [
    ["Crypto", "₮"],
    ["JazzCash", "J"],
    ["Easypaisa", "e"]
  ].filter(([name]) =>
    settings.some((item) => item.method === name)
  );

  const channels = settings.filter(
    (item) => item.method === method
  );

  const selectedSetting = channels.find(
    (item) => item._id === channel
  );

  function selectMethod(name) {
    setMethod(name);

    const first = settings.find(
      (item) => item.method === name
    );

    setChannel(first?._id || "");
    setError("");
  }


  async function handleDeposit() {
    setError("");
    setSuccess("");

    if (!selectedSetting) {
      setError("Please select a payment channel");
      return;
    }

    const value = Number(amount);

    if (
      !amount ||
      !Number.isFinite(value) ||
      value < selectedSetting.minAmount ||
      value > selectedSetting.maxAmount
    ) {
      setError(
        `Enter an amount between Rs ${selectedSetting.minAmount} and Rs ${selectedSetting.maxAmount}`
      );
      return;
    }

    const reference = transactionId.trim();

    if (!/^[a-zA-Z0-9_-]{6,100}$/.test(reference)) {
      setError("Enter a valid transaction ID (minimum 6 characters)");
      return;
    }

    const token = localStorage.getItem("userToken");

    if (!token) {
      setError("Please login before submitting a deposit");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/deposit-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentSetting: selectedSetting._id,
          amount: value,
          transactionId: reference
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Deposit submission failed");
      }

      setSuccess("Deposit request submitted. Awaiting admin verification.");
      setAmount("");
      setTransactionId("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="phone-shell finance-shell deposit-shell">
      <PageHeader onBack={onBack} title="Deposit" />

      <div className="finance-content">
        {error && (
          <p role="alert" style={{ color: "#ff7777", padding: "10px 0" }}>
            {error}
          </p>
        )}

        <h3>Payment Methods <sup>*</sup></h3>

        <div className="method-grid">
          {methods.map(([name, icon]) => (
            <button
              key={name}
              type="button"
              className={method === name ? "selected" : ""}
              onClick={() => selectMethod(name)}
            >
              <span>{icon}</span>
              <b>{name}</b>
            </button>
          ))}
        </div>

        {loading && <p>Loading payment methods...</p>}

        {!loading && methods.length === 0 && (
          <p>No payment methods available.</p>
        )}

        {channels.length > 0 && (
          <>
            <h3>Select channel <sup>*</sup></h3>

            <div className="channel-row">
              {channels.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className={channel === item._id ? "selected" : ""}
                  onClick={() => {
                    setChannel(item._id);
                    setError("");
                  }}
                >
                  {item.channel}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedSetting && (
          <section className="amount-panel">
            <h3>
              Deposit Amount
              <small>
                Min: {selectedSetting.minAmount} Max: {selectedSetting.maxAmount}
              </small>
            </h3>

            <div className="amount-input">
              <span>▰</span>
              <input
                type="number"
                min={selectedSetting.minAmount}
                max={selectedSetting.maxAmount}
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <b>Rs</b>
            </div>

            <h3>Payment Details</h3>

            {selectedSetting.accountTitle && (
              <p>
                Account Title: <strong>{selectedSetting.accountTitle}</strong>
              </p>
            )}

            <div className="deposit-account-details">
              <span>{selectedSetting.accountDetails}</span>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    selectedSetting.accountDetails
                  )
                }
              >
                <Copy size={17} />
                Copy
              </button>
            </div>

            <h4>Recharge Instructions</h4>
            <p>
              Payment details verify karein. Transaction confirmation
              available hone tak payment automatically account mein
              credit nahi hogi.
            </p>
          </section>
        )}


        {selectedSetting && (
          <div style={{ padding: "12px 0" }}>
            <label htmlFor="deposit-transaction-id">
              Transaction / Reference ID
            </label>

            <input
              id="deposit-transaction-id"
              type="text"
              maxLength={100}
              placeholder="Enter payment transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              style={{
                width: "100%",
                padding: "13px",
                marginTop: "8px",
                borderRadius: "8px",
                border: "1px solid #685698",
                background: "#241b48",
                color: "#fff"
              }}
            />
          </div>
        )}

        {success && (
          <p role="status" style={{ color: "#49db93", padding: "10px 0" }}>
            {success}
          </p>
        )}

        <button
          type="button"
          className="finance-submit"
          disabled={!selectedSetting || submitting}
          onClick={handleDeposit}
        >
          {submitting ? "Submitting..." : "Deposit"}
        </button>

      </div>
    </div>
  );
}



function WithdrawPage({ onBack, onPage }) {
  const [method, setMethod] = useState("Crypto");
  const [accountDetails, setAccountDetails] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [reservedBalance, setReservedBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadBalance() {
      try {
        const token = localStorage.getItem("userToken");

        if (!token) {
          throw new Error("Please login first");
        }

        const res = await fetch(
          `${API}/api/withdrawal-requests/balance`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal,
            cache: "no-store"
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load balance");
        }

        setBalance(data.balance ?? 0);
        setReservedBalance(data.reservedBalance ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBalance();

    return () => controller.abort();
  }, []);

  async function handleWithdraw(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);

    if (
      !amount ||
      !Number.isFinite(value) ||
      value < 100 ||
      value > 50000
    ) {
      setError("Withdrawal amount must be between Rs 100 and Rs 50,000");
      return;
    }

    if (value > balance) {
      setError("Insufficient available balance");
      return;
    }

    if (!accountDetails.trim()) {
      setError("Enter your withdrawal account details");
      return;
    }

    const token = localStorage.getItem("userToken");

    if (!token) {
      setError("Please login first");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/withdrawal-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          method,
          accountDetails: accountDetails.trim(),
          accountTitle: accountTitle.trim(),
          amount: value
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Withdrawal failed");
      }

      setBalance((current) => current - value);
      setReservedBalance((current) => current + value);
      setAmount("");
      setSuccess("Withdrawal request submitted. Awaiting admin review.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="phone-shell finance-shell withdraw-shell">
      <PageHeader onBack={onBack} title="Withdraw" />

      <button
        type="button"
        onClick={() => onPage("withdraw-history")}
        className="withdraw-history-link"
      >
        <WalletCards size={18} />
        Withdrawal History
        <ChevronRight size={18} />
      </button>

      <form onSubmit={handleWithdraw}>
        <div className="withdraw-content">
          {error && (
            <p role="alert" style={{ color: "#ff7777", padding: "10px 0" }}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" style={{ color: "#4ade80", padding: "10px 0" }}>
              {success}
            </p>
          )}

          <div className="balance-grid">
            <div>
              Cash Balance
              <strong>
                {loading
                  ? "..."
                  : (balance + reservedBalance).toFixed(2)}
                <small> Rs</small>
              </strong>
            </div>

            <div>
              Available
              <strong>
                {loading ? "..." : balance.toFixed(2)}
                <small> Rs</small>
              </strong>
            </div>
          </div>

          <div className="withdraw-tabs">
            <button type="button" className="active">
              Normal withdrawal
            </button>
          </div>

          <div className="withdraw-methods">
            {[
              ["Crypto", "₮"],
              ["Easypaisa", "e"],
              ["JazzCash", "J"],
              ["Bank", "▣"]
            ].map(([name, icon]) => (
              <button
                type="button"
                key={name}
                className={method === name ? "selected" : ""}
                onClick={() => {
                  setMethod(name);
                  setAccountDetails("");
                  setAccountTitle("");
                }}
              >
                <span>{icon}</span>
                <b>{name}</b>
              </button>
            ))}
          </div>

          <div className="withdraw-account-form">
            <h3>Withdrawal Account</h3>

            <label>
              {method === "Crypto"
                ? "Wallet Address"
                : method === "Bank"
                  ? "Bank Name / IBAN / Account Number"
                  : `${method} Mobile Number`}

              <input
                required
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder={
                  method === "Crypto"
                    ? "Enter wallet address"
                    : method === "Bank"
                      ? "Enter bank account details"
                      : "03XXXXXXXXX"
                }
              />
            </label>

            <label>
              Account Holder Name

              <input
                type="text"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                placeholder="Enter account holder name"
              />
            </label>
          </div>

          <h3>
            Withdrawal Amount <sup>*</sup>
            <small>Min: 100 Max: 50,000</small>
          </h3>

          <div className="amount-input">
            <span>Rs</span>
            <input
              required
              type="number"
              min="100"
              max="50000"
              step="0.01"
              placeholder="Enter withdrawal amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <ul className="withdraw-rules">
            <li>Minimum withdrawal: Rs 100</li>
            <li>Maximum withdrawal: Rs 50,000</li>
            <li>Withdrawal requests require admin review.</li>
            <li>Pending withdrawal amount remains reserved.</li>
            <li>Rejected withdrawals return to available balance.</li>
          </ul>
        </div>

        <button
          type="submit"
          className="withdraw-submit"
          disabled={loading || submitting || balance < 100}
        >
          {submitting ? "Submitting..." : "Withdraw"}
        </button>
      </form>
    </div>
  );
}



function WithdrawalHistory({ onBack }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        const token = localStorage.getItem("userToken");

        if (!token) {
          throw new Error("Please login first");
        }

        const response = await fetch(
          `${API}/api/withdrawal-requests/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal,
            cache: "no-store"
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load history");
        }

        setWithdrawals(data.withdrawals || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, []);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  const filtered = withdrawals.filter(
    (item) => new Date(item.createdAt) >= startDate
  );

  const total = filtered
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + item.amount, 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB");

  return (
    <div className="phone-shell history-shell">
      <PageHeader
        onBack={onBack}
        title="Withdrawal history"
      />

      <div className="history-tabs">
        {[1, 7, 30].map((value) => (
          <button
            type="button"
            key={value}
            onClick={() => setDays(value)}
            className={days === value ? "active" : ""}
          >
            {value} Days
          </button>
        ))}

        <p>
          {formatDate(startDate)} to {formatDate(now)}
          <span>Total: Rs {total.toLocaleString()}</span>
        </p>
      </div>

      {loading && (
        <p style={{ padding: 20 }}>Loading history...</p>
      )}

      {error && (
        <p
          role="alert"
          style={{ padding: 20, color: "#ff7777" }}
        >
          {error}
        </p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-history">
          <span>▱</span>
          <p>It is empty here</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="withdrawal-history-list">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="withdrawal-history-card"
            >
              <div className="withdrawal-history-top">
                <strong>
                  Rs {Number(item.amount).toLocaleString()}
                </strong>

                <span className={`status-${item.status}`}>
                  {item.status}
                </span>
              </div>

              <p>{item.method}</p>

              <p>
                {new Date(item.createdAt).toLocaleString()}
              </p>

              <p className="withdrawal-history-account">
                {item.accountDetails}
              </p>

              {item.payoutReference && (
                <p>Reference: {item.payoutReference}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function GamesPage({ onBack }) {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const gameList = [...games, { name: 'Dragon Tiger', tone: 'blue', mark: 'DT', type: 'CASINO' }, { name: 'Money Coming', tone: 'gold', mark: '$', type: 'SLOTS' }, { name: 'Teen Patti', tone: 'red', mark: 'TP', type: 'CARD' }];
  return <div className="phone-shell games-shell"><div className="games-title"><button onClick={onBack}><ArrowLeft /></button><strong>KoolBet</strong><label><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />⌕</label></div><div className="games-tabs">{['All', 'Hot', 'Recent'].map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><div className="games-browser"><div className="provider-list">{['KoolBet', 'INOUT', 'SPRIBE', 'JILI', '2J Games', 'FC', 'JDB'].map((provider) => <button key={provider}>{provider}</button>)}</div><div className="browser-grid">{gameList.filter((game) => game.name.toLowerCase().includes(search.toLowerCase())).map((game) => <GameCard game={game} onPage={() => { }} key={game.name} />)}</div></div></div>;
}

function RoulettePage({ onBack }) {
  return <div className="phone-shell roulette-shell"><div className="roulette-top"><button onClick={onBack}><ArrowLeft /></button><span>♬ &nbsp; ****7629 successfully withdrawn money!</span><b>◉ 0</b></div><div className="roulette-hero"><button>Rule</button><button>Record</button><h1>Deposit spinner<br />rewards up to 3,779</h1><button className="deposit-now">Deposit now</button></div><div className="reward-levels">{['most 399', 'most 799', 'most 1,999', 'most 3,779'].map((item) => <div key={item}>◎<span>{item}</span></div>)}</div><p className="spin-copy">Deposit 500 to get 1 spins.</p><div className="spin-track"><i>500<br /><b>+1 Spin</b></i><i>1,500<br /><b>+1 Spin</b></i></div><div className="wheel"><div className="wheel-center">GO<br /><span>Spin*0</span></div><div className="wheel-labels"><span>Free Spin*2</span><span>399</span><span>79</span><span>299</span><span>Free Spin*1</span><span>39</span><span>69</span><span>199</span></div></div></div>;
}

function BonusModal({ onClose }) {
  return <div className="bonus-backdrop" onMouseDown={onClose}><div className="bonus-modal" onMouseDown={(event) => event.stopPropagation()}><div className="bonus-ribbon">Available Bonus</div>{[['Invite Turntable', '1,500'], ['Mail', 'GO'], ['Super Member Day', 'GO'], ['Invitation Rewards', 'GO'], ['First deposit', 'GO']].map(([title, value], index) => <div className="bonus-row" key={title}><b>{title}</b><button>{value}</button>{index === 2 && <small>4Day 05:36:01</small>}</div>)}<button className="bonus-close" onClick={onClose}><X /></button></div></div>;
}


function VipPage({ onBack, onPage }) {
  const [user, setUser] = useState(null);
  const [vip, setVip] = useState(null);
  const [vipTab, setVipTab] = useState("privileges");

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("userToken");

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));

        fetch(`${API}/api/auth/vip`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then((res) => {
            if (!res.ok) throw new Error("VIP data unavailable");
            return res.json();
          })
          .then((data) => setVip(data.vip))
          .catch(() => setVip(null));
      }
    } catch {
      setUser(null);
    }
  }, []);

  const privilegeRewards = [
    [1, "100", "1.5", "0.15%"],
    [2, "300", "2.5", "0.2%"],
    [3, "500", "3.5", "0.21%"],
    [4, "700", "7.5", "0.22%"],
    [5, "1,000", "11.5", "0.23%"],
    [6, "3,000", "35", "0.24%"],
    [7, "5,000", "55", "0.25%"],
    [8, "7,000", "75", "0.26%"],
    [9, "10,000", "115", "0.27%"],
    [10, "30,000", "315", "0.28%"],
    [11, "50,000", "515", "0.28%"],
    [12, "70,000", "715", "0.3%"],
    [13, "100,000", "1,115", "0.31%"],
    [14, "300,000", "3,315", "0.32%"],
    [15, "500,000", "5,515", "0.33%"],
    [16, "700,000", "7,715", "0.34%"],
    [17, "1,000,000", "11,115", "0.35%"],
    [18, "3,000,000", "33,315", "0.36%"],
    [19, "5,000,000", "55,515", "0.37%"],
    [20, "7,000,000", "88,815", "0.38%"],
    [21, "10,000,000", "111,115", "0%"],
    [22, "30,000,000", "333,315", "0%"],
    [23, "50,000,000", "555,515", "0%"],
    [24, "70,000,000", "777,715", "0%"],
    [25, "100,000,000", "1,111,115", "0%"],
    [26, "300,000,000", "3,333,315", "0%"],
    [27, "700,000,000", "7,777,719", "0%"]
  ];

  const weeklyRewards = [
    [1, "60", "1.1"],
    [2, "120", "2.1"],
    [3, "250", "3.1"],
    [4, "350", "4.1"],
    [5, "450", "5.1"],
    [6, "550", "6.1"],
    [7, "1,200", "12"],
    [8, "2,500", "15"],
    [9, "3,500", "18"],
    [10, "6,000", "28"],
    [11, "18,000", "68"],
    [12, "35,000", "88"],
    [13, "50,000", "108"],
    [14, "75,000", "388"],
    [15, "225,000", "888"],
    [16, "375,000", "1,288"],
    [17, "625,000", "1,588"],
    [18, "875,000", "3,888"],
    [19, "2,500,000", "6,888"],
    [20, "3,750,000", "8,888"],
    [21, "6,250,000", "9,888"],
    [22, "25,000,000", "10,888"],
    [23, "37,500,000", "11,888"],
    [24, "62,500,000", "12,888"],
    [25, "87,500,000", "13,888"],
    [26, "200,000,000", "14,888"],
    [27, "500,000,000", "15,888"]
  ];

  return (
    <div className="phone-shell vip-shell">
      <PageHeader onBack={onBack} title="VIP" />

      <div className="vip-heading">
        <div className="vip-avatar">VIP</div>
        <b>
          ⌄ UID {user?.id?.slice(-8).toUpperCase() || "Loading..."}
        </b>
        <span>0<sup>1TM</sup></span>
      </div>

      <section className="vip-level">
        <div className="crown">♛</div>
        <strong>VIP {vip?.level ?? 1}</strong>

        <div>
          <small>Next level</small>
          <b>{vip?.totalDeposits ?? 0}/100</b>
          <hr />
          <small>Accumulated deposits</small>
          <b>{vip?.totalBets ?? 0}/500</b>
          <hr />
          <small>Accumulated bets</small>
        </div>
      </section>

      <div className="vip-grid">
        {[
          ["Level up rewards", "1.5"],
          ["Weekly reward", "1.1"],
          ["Monthly reward", "1.9"],
          ["Rebate Rate", "0.15%"]
        ].map(([name, value]) => (
          <div key={name}>
            <span>▣</span>
            <b>{name}</b>
            <strong>{value}</strong>
            <button type="button" disabled title="Not yet available">
              ▣
            </button>
          </div>
        ))}
      </div>

      <section className="vip-table">
        <h2>Accumulated monthly deposits increase VIP level</h2>

        <div className="vip-tabs">
          {[
            ["privileges", "VIP privileges"],
            ["weekly", "Weekly reward"],
            ["monthly", "Monthly reward"]
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setVipTab(id)}
              className={vipTab === id ? "active" : ""}
            >
              {label}
            </button>
          ))}
        </div>

        {vipTab === "privileges" && (
          <>
            <div className="vip-table-row">
              <span>grade</span>
              <span>deposit</span>
              <span>Level up rewards</span>
              <span>Rebate Rate</span>
            </div>

            {privilegeRewards.map(([level, deposit, reward, rebate]) => (
              <div className="vip-table-row" key={level}>
                <span>{level}</span>
                <span>{deposit}</span>
                <span>{reward}</span>
                <span>{rebate}</span>
              </div>
            ))}
          </>
        )}

        {vipTab === "weekly" && (
          <>
            <div className="vip-table-row vip-weekly-row">
              <span>grade</span>
              <span>Weekly cumulative bets</span>
              <span>Reward</span>
            </div>

            {weeklyRewards.map(([grade, bets, reward]) => (
              <div className="vip-table-row vip-weekly-row" key={grade}>
                <span>{grade}</span>
                <span>{bets}</span>
                <span>{reward}</span>
              </div>
            ))}
          </>
        )}


        {vipTab === "monthly" && (
          <>
            <div className="vip-table-row vip-weekly-row">
              <span>grade</span>
              <span>Monthly cumulative bets</span>
              <span>Reward</span>
            </div>

            {[
              [1, "100", "1.9"],
              [2, "200", "2.9"],
              [3, "500", "3.9"],
              [4, "1,000", "8.9"],
              [5, "2,000", "12.9"],
              [6, "4,000", "39"],
              [7, "7,000", "59"],
              [8, "10,000", "79"],
              [9, "15,000", "119"],
              [10, "35,000", "319"],
              [11, "60,000", "519"],
              [12, "80,000", "719"],
              [13, "130,000", "1,119"],
              [14, "350,000", "3,319"],
              [15, "570,000", "5,519"],
              [16, "900,000", "7,719"],
              [17, "1,500,000", "11,119"],
              [18, "3,500,000", "33,319"],
              [19, "10,000,000", "55,519"],
              [20, "15,000,000", "88,819"],
              [21, "25,000,000", "111,119"],
              [22, "100,000,000", "333,319"],
              [23, "150,000,000", "555,519"],
              [24, "250,000,000", "777,719"],
              [25, "350,000,000", "1,111,119"],
              [26, "800,000,000", "3,333,319"],
              [27, "2,000,000,000", "7,777,719"]
            ].map(([grade, bets, reward]) => (
              <div className="vip-table-row vip-weekly-row" key={grade}>
                <span>{grade}</span>
                <span>{bets}</span>
                <span>{reward}</span>
              </div>
            ))}
          </>
        )}

      </section>

      <button
        className="ranking-link"
        onClick={() => onPage("ranking")}
      >
        View ranking
      </button>
    </div>
  );
}


function RankingPage({ onBack }) {
  const people = ['****5277', '****7442', '****3385', '****4073', '****7952', '****9867'];
  return <div className="phone-shell ranking-shell"><PageHeader onBack={onBack} tabs={['Ranking', 'Rules', 'My rewards']} active="Ranking" setActive={() => { }} /><div className="ranking-hero"><div className="ranking-tabs"><span>Daily</span><span>Weekly</span><span>Monthly</span></div><strong>JACKPOT</strong><b>22,487.73</b><small>ⓘ 1.4% of total bets by all 81CC.COM players.</small><div className="podium"><div>♛<b>****7442</b><small>Reward: 6%</small></div><div>♛<b>****5277</b><small>Reward: 9.5%</small></div><div>♛<b>****3385</b><small>Reward: 4.5%</small></div></div></div><div className="ranking-list">{people.slice(3).map((person, index) => <div key={person}><strong>{index + 4}</strong><span className="person-avatar">{index + 4}</span><b>{person}<small>Reward {2.94 - index * .3}%</small></b><em>Total Bets<br />598,684.46</em></div>)}</div><div className="rank-footer"><b>No rank</b><span>No Bets <strong>0</strong><br />My rewards <strong>0 %</strong></span><span>Ranks left<br /><strong>228,268.02</strong></span></div></div>;
}


function CategoryDetailPage({ categoryId, onBack }) {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [activeCategory, setActiveCategory] = useState(categoryId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [categoryRes, gameRes] = await Promise.all([
          fetch(`${API}/api/categories`, { signal: controller.signal }),
          fetch(`${API}/api/subcategory-layouts/${categoryId}`, {
            signal: controller.signal,
            cache: "no-store"
          })
        ]);

        if (!categoryRes.ok || !gameRes.ok) {
          throw new Error("Failed to load category");
        }

        const [categoryData, gameData] = await Promise.all([
          categoryRes.json(),
          gameRes.json()
        ]);

        setCategories(categoryData.categories || []);
        setGames(gameData.games || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [categoryId]);

  useEffect(() => {
    setActiveCategory(categoryId);
  }, [categoryId]);

  const getId = (item) =>
    typeof item === "string" ? item : item?._id;

  const currentCategory = categories.find(
    (item) => item._id === activeCategory
  );

  const subcategories = [];

  const visibleGames = games;

  return (
    <div className="phone-shell games-shell">
      <div className="games-title">
        <button onClick={onBack}>
          <ArrowLeft size={23} />
        </button>
        <strong>{currentCategory?.name || "Games"}</strong>
      </div>

      {loading ? (
        <p className="p-5">Loading...</p>
      ) : error ? (
        <p className="p-5">{error}</p>
      ) : (
        <div className="games-browser">
          <div className="provider-list" style={{ display: "none" }} />

          <div className="browser-grid">
            {visibleGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                onPage={() => { }}
              />
            ))}

            {!visibleGames.length && (
              <p>No games available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



export default function Home() {
  const [page, setPage] = useState("home");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [auth, setAuth] = useState(null);

  // Smart popup states
  const [popups, setPopups] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [lastPopupId, setLastPopupId] = useState(null);

  const openPage = (pageName, categoryId = null) => {
    setSelectedCategoryId(categoryId);
    setPage(pageName);
  };

  // Load active popups
  useEffect(() => {
    let cancelled = false;

    async function loadPopups() {
      try {
        const response = await fetch(`${API}/api/popups`, {
          cache: "no-store"
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setPopups(
            Array.isArray(data.popups) ? data.popups : []
          );
        }
      } catch (error) {
        console.error("Popup loading failed:", error);
      }
    }

    loadPopups();

    // Refresh popup configuration every 60 seconds
    const refreshTimer = setInterval(loadPopups, 60000);

    return () => {
      cancelled = true;
      clearInterval(refreshTimer);
    };
  }, []);

  // Weighted random selection without immediate repeat
  function selectPopup(items, previousId) {
    if (!items.length) return null;

    const candidates =
      items.length > 1
        ? items.filter((item) => item._id !== previousId)
        : items;

    if (!candidates.length) return null;

    const totalWeight = candidates.reduce(
      (sum, item) => sum + Math.max(1, Number(item.intensity) || 1),
      0
    );

    let random = Math.random() * totalWeight;

    for (const item of candidates) {
      random -= Math.max(1, Number(item.intensity) || 1);

      if (random < 0) return item;
    }

    return candidates[candidates.length - 1];
  }

  // Automatically display popup
  useEffect(() => {
    if (!popups.length || activePopup || auth) return;

    // Use the shortest configured interval as the next popup delay.
    const intervalSeconds = Math.min(
      ...popups.map((item) =>
        Math.max(10, Number(item.intervalSeconds) || 60)
      )
    );

    const timer = setTimeout(() => {
      if (document.visibilityState !== "visible") return;

      const next = selectPopup(popups, lastPopupId);

      if (next) {
        setLastPopupId(next._id);
        setActivePopup(next);
      }
    }, intervalSeconds * 1000);

    return () => clearTimeout(timer);
  }, [popups, activePopup, auth, lastPopupId]);

  function handlePopupClick() {
    if (!activePopup) return;

    const popup = activePopup;
    setActivePopup(null);

    if (popup.targetType === "external") {
      try {
        const url = new URL(popup.target);

        if (url.protocol === "https:") {
          window.open(url.href, "_blank", "noopener,noreferrer");
        }
      } catch {
        console.error("Invalid popup URL");
      }

      return;
    }

    const allowedPages = [
      "home",
      "promo",
      "earn",
      "mine",
      "service",
      "roulette",
      "deposit",
      "withdraw",
      "withdraw-history",
      "vip",
      "ranking"
    ];

    if (allowedPages.includes(popup.target)) {
      openPage(popup.target);
    }
  }

  return (
    <div className="app-background">
      {page === "home" && (
        <HomePage onAuth={setAuth} onPage={openPage} />
      )}

      {page === "promo" && (
        <ActivityPage onBack={() => setPage("home")} />
      )}

      {page === "earn" && (
        <EarnPage
          onBack={() => setPage("home")}
          onPage={setPage}
        />
      )}

      {page === "mine" && (
        <VipPage
          onBack={() => setPage("home")}
          onPage={setPage}
        />
      )}

      {(page === "service" || page === "service-mail") && (
        <ServicePage onBack={() => setPage("home")} />
      )}

      {page === "roulette" && (
        <RoulettePage onBack={() => setPage("home")} />
      )}

      {page === "deposit" && (
        <DepositPage onBack={() => setPage("home")} />
      )}

      {page === "withdraw" && (
        <WithdrawPage
          onBack={() => setPage("home")}
          onPage={setPage}
        />
      )}

      {page === "withdraw-history" && (
        <WithdrawalHistory
          onBack={() => setPage("home")}
        />
      )}

      {page === "games" && (
        <GamesPage onBack={() => setPage("home")} />
      )}

      {page === "category" && selectedCategoryId && (
        <CategoryDetailPage
          categoryId={selectedCategoryId}
          onBack={() => setPage("home")}
        />
      )}

      {page === "vip" && (
        <VipPage
          onBack={() => setPage("home")}
          onPage={setPage}
        />
      )}

      {page === "ranking" && (
        <RankingPage onBack={() => setPage("home")} />
      )}

      {auth && (
        <AuthModal
          mode={auth}
          onClose={() => setAuth(null)}
          onMode={setAuth}
        />
      )}

      {page === "bonus" && (
        <>
          <HomePage
            onAuth={setAuth}
            onPage={openPage}
          />
          <BonusModal
            onClose={() => setPage("home")}
          />
        </>
      )}

      {/* Automatic Smart Popup */}
      {activePopup && !auth && (
        <div
          className="smart-popup-overlay"
          onClick={() => setActivePopup(null)}
        >
          <div
            className="smart-popup-card"
            role="dialog"
            aria-modal="true"
            aria-label={activePopup.title || "Promotion"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="smart-popup-close"
              aria-label="Close popup"
              onClick={() => setActivePopup(null)}
            >
              ×
            </button>

            <button
              type="button"
              className="smart-popup-content"
              onClick={handlePopupClick}
            >
              {activePopup.type === "image" ? (
                <img
                  src={activePopup.image?.url}
                  alt={activePopup.title || "Promotion"}
                />
              ) : (
                <div className="smart-popup-text">
                  <h2>{activePopup.title}</h2>
                  <p>{activePopup.text}</p>
                  <span>Tap to continue →</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

