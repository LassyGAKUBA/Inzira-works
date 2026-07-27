import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../../lib/supabase";

const DARK = "#172420";
const MUTED = "#5c7068";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function buildMessage(role, payload) {
  const b = payload.new;
  if (role === "provider" && payload.eventType === "INSERT") {
    return `New booking request: ${b.title || "a service"}`;
  }
  if (role === "customer" && payload.eventType === "UPDATE") {
    const msgs = {
      confirmed: `Booking confirmed: ${b.title}`,
      rejected:  `Booking declined: ${b.title}`,
      completed: `${b.title} — service complete. Leave a review!`,
    };
    return msgs[b.status] ?? null;
  }
  return null;
}

export default function NotificationBell({ userId, role }) {
  const [notifs, setNotifs] = useState([]);
  const [open,   setOpen]   = useState(false);
  const ref = useRef(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!userId) return;
    const filter = role === "provider"
      ? `provider_id=eq.${userId}`
      : `customer_id=eq.${userId}`;

    const channel = supabase
      .channel(`notif-${role}-${userId}`)
      .on("postgres_changes", {
        event:  role === "provider" ? "INSERT" : "UPDATE",
        schema: "public",
        table:  "bookings",
        filter,
      }, (payload) => {
        const text = buildMessage(role, payload);
        if (text) {
          setNotifs(prev =>
            [{ id: Date.now(), text, time: Date.now(), read: false }, ...prev].slice(0, 15)
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, role]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={handleOpen} aria-label="Notifications"
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: 6 }}>
        <Bell size={18} />
        {unread > 0 && (
          <span style={{ position: "absolute", top: -1, right: -1, backgroundColor: "#e05c5c", color: "white", borderRadius: "50%", width: 15, height: 15, fontSize: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, lineHeight: 1 }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 290, backgroundColor: "white", borderRadius: 12, border: "1px solid #e8e2d8", boxShadow: "0 8px 32px rgba(14,92,70,0.15)", zIndex: 9999, overflow: "hidden" }}>
          <div style={{ padding: "13px 16px 10px", borderBottom: "1px solid #f0ece4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SERIF, color: DARK, fontWeight: 700, fontSize: "0.9rem" }}>Notifications</span>
            {notifs.length > 0 && (
              <button onClick={() => setNotifs([])} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, fontSize: "0.7rem", fontFamily: SANS, padding: 0 }}>
                Clear all
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", color: MUTED, fontSize: "0.8rem", fontFamily: SANS }}>
              No new notifications
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifs.map((n, i) => (
                <div key={n.id} style={{ padding: "12px 16px", borderTop: i > 0 ? "1px solid #f5f2ec" : "none", backgroundColor: n.read ? "white" : "#f9f7f3" }}>
                  <p style={{ color: DARK, fontSize: "0.8rem", fontFamily: SANS, margin: 0, lineHeight: 1.45 }}>{n.text}</p>
                  <p style={{ color: MUTED, fontSize: "0.68rem", fontFamily: SANS, marginTop: 4 }}>{timeAgo(n.time)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
