import { useState, useEffect } from "react";
import { Icon, StatusBadge } from "./Shared.jsx";
import { supabase } from '../../lib/supabase';

export default function FeedbackPage({ onBadgeUpdate }) {
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    setLoading(true);
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedback:", error);
      setLoading(false);
      return;
    }

    const feedbackItems = data || [];
    setItems(feedbackItems);

    // Notify parent of open count for sidebar badge
    if (onBadgeUpdate) {
      onBadgeUpdate(feedbackItems.filter((f) => f.status === "open").length);
    }

    setLoading(false);
  }

  const filtered = items.filter((f) => tab === "all" || f.status === tab);

  const sendReply = async () => {
    if (!reply.trim()) return;

    const { error } = await supabase
      .from("feedback")
      .update({ reply, status: "resolved" })
      .eq("id", selected.id);

    if (error) {
      console.error("Error sending reply:", error);
      return;
    }

    const updatedItems = items.map((f) =>
      f.id === selected.id ? { ...f, reply, status: "resolved" } : f
    );
    setItems(updatedItems);
    setSelected((prev) => ({ ...prev, reply, status: "resolved" }));
    setReply("");

    // Update badge count in parent
    if (onBadgeUpdate) {
      onBadgeUpdate(updatedItems.filter((f) => f.status === "open").length);
    }
  };

  const priorityColor = { high: "#e53535", medium: "#eab308", low: "#6b7280" };

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 120px)" }}>

      {/* ── Inbox list ── */}
      <div
        className="card"
        style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div className="card-header" style={{ flexShrink: 0 }}>
          <div className="card-title">All Feedback</div>
          <span className="badge badge-red">
            <span className="badge-dot" />
            {items.filter((f) => f.status === "open").length} open
          </span>
        </div>

        {/* Tabs */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border2)", display: "flex", gap: 6, flexShrink: 0 }}>
          {["all", "open", "resolved"].map((t) => (
            <button
              key={t}
              className={`pill-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
              style={{ margin: 0, textTransform: "capitalize", fontSize: 12, padding: "4px 12px" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div className="empty-state" style={{ marginTop: 48 }}>
              <p>Loading feedback…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 48 }}>
              <Icon name="feedback" size={28} />
              <p>No items in this view.</p>
            </div>
          ) : (
            filtered.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelected(f)}
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border2)",
                  cursor: "pointer",
                  background: selected?.id === f.id ? "var(--bg3)" : "transparent",
                  transition: "background 0.15s",
                  borderLeft: selected?.id === f.id ? "3px solid var(--green)" : "3px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{f.from}</span>
                  <StatusBadge status={f.status} />
                </div>

                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.subject}
                </div>

                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <StatusBadge status={f.type} />
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 10, fontWeight: 700, color: priorityColor[f.priority],
                    background: `${priorityColor[f.priority]}18`, padding: "2px 8px", borderRadius: 20,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: priorityColor[f.priority], display: "inline-block" }} />
                    {f.priority}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-light)", marginLeft: "auto" }}>{f.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Thread / detail view ── */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected ? (
          <>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <div>
                <div className="card-title">{selected.subject}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <StatusBadge status={selected.type} />
                  <StatusBadge status={selected.priority} />
                  <StatusBadge status={selected.status} />
                  <span style={{ fontSize: 12, color: "var(--text-light)" }}>{selected.date}</span>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div className="thread-msg from-user">
                <div className="thread-meta">{selected.from} · {selected.date}</div>
                {selected.message}
              </div>
              {selected.reply && (
                <div className="thread-msg from-admin">
                  <div className="thread-meta" style={{ color: "var(--green)" }}>Admin · Replied</div>
                  {selected.reply}
                </div>
              )}
            </div>

            {!selected.reply && (
              <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border2)", flexShrink: 0 }}>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Write a reply…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  style={{ resize: "none", marginBottom: 10, fontSize: 13.5 }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="btn btn-primary" onClick={sendReply}>
                    <Icon name="check" size={13} />
                    Send Reply &amp; Resolve
                  </button>
                </div>
              </div>
            )}

            {selected.reply && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border2)", background: "rgba(29,184,122,0.05)", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green)", fontSize: 13, fontWeight: 600 }}>
                  <Icon name="check" size={14} />
                  Issue resolved — reply sent
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ margin: "auto" }}>
            <Icon name="feedback" size={32} />
            <p style={{ marginTop: 12 }}>Select a feedback item to view the thread</p>
          </div>
        )}
      </div>
    </div>
  );
}