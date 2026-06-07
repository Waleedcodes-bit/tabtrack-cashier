import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, CreditCard, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { supabase } from "../../lib/supabase";

const iconMap = {
  user:    <UserPlus size={18} />,
  payment: <CreditCard size={18} />,
  alert:   <AlertTriangle size={18} />,
  success: <CheckCircle size={18} />,
  money:   <DollarSign size={18} />,
};

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

const styles = `
  :root {
    --bg: #0b1220;
    --card: #111827;
    --accent: #6366f1;
    --green: #22c55e;
    --red: #ef4444;
    --text: #f9fafb;
    --text-dim: #9ca3af;
    --border: rgba(255,255,255,0.06);
  }

  .activity-page { padding: 24px; background: var(--bg); min-height: 100vh; color: var(--text); font-family: Inter, sans-serif; }
  .activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .activity-header h1 { font-size: 26px; }
  .activity-header p { color: var(--text-dim); font-size: 14px; }
  .activity-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
  .card { background: linear-gradient(145deg, #111827, #0b1220); border: 1px solid var(--border); border-radius: 16px; padding: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
  .card-title { margin-bottom: 16px; font-size: 16px; }
  .activity-list { display: flex; flex-direction: column; gap: 10px; }
  .activity-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; transition: 0.2s; }
  .activity-item:hover { background: rgba(255,255,255,0.04); }
  .icon-box { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .icon-box.user    { background: rgba(99,102,241,0.2); }
  .icon-box.payment { background: rgba(34,197,94,0.2); }
  .icon-box.alert   { background: rgba(239,68,68,0.2); }
  .icon-box.success { background: rgba(34,197,94,0.2); }
  .icon-box.money   { background: rgba(250,204,21,0.2); }
  .activity-content { flex: 1; }
  .activity-content .title { font-size: 14px; }
  .activity-content span { font-size: 12px; color: var(--text-dim); }
  .time { font-size: 12px; color: var(--text-dim); }
  .side-column { display: flex; flex-direction: column; gap: 20px; }
  .status-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .green { color: var(--green); }
  .red { color: var(--red); }
  .accent { color: var(--accent); }
  .primary-btn { background: var(--accent); border: none; padding: 10px 16px; border-radius: 10px; color: white; cursor: pointer; }
  .ghost-btn { width: 100%; background: transparent; border: 1px solid var(--border); padding: 10px; border-radius: 10px; margin-top: 10px; color: var(--text); cursor: pointer; }
  .ghost-btn:hover { background: rgba(255,255,255,0.05); }
  .empty-dim { text-align: center; color: var(--text-dim); padding: 24px 0; font-size: 13px; }
`;

export default function ActivityPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ activeAccounts: 0, openIssues: 0, monthlyRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
    fetchStats();
  }, []);

  async function fetchActivity() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) console.error('Error fetching activity:', error);
    else setActivities(data || []);
    setLoading(false);
  }

  async function fetchStats() {
    // Active accounts
    const { count: activeCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'owner')
      .eq('status', 'active');

    // Open issues (disputes) — using orders as proxy for now
    const { count: issueCount } = await supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'alert');

    // Monthly revenue from payments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: paymentData } = await supabase
      .from('payments')
      .select('amount')
      .gte('created_at', startOfMonth.toISOString());

    const revenue = (paymentData || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    setStats({
      activeAccounts: activeCount || 0,
      openIssues: issueCount || 0,
      monthlyRevenue: revenue,
    });
  }

  return (
    <>
      <style>{styles}</style>
      <div className="activity-page">

        <div className="activity-header">
          <div>
            <h1>Activity</h1>
            <p>Monitor system activity and events</p>
          </div>
          <button className="primary-btn" onClick={fetchActivity}>Refresh</button>
        </div>

        <div className="activity-grid">
          {/* LEFT — activity feed */}
          <div className="card">
            <h3 className="card-title">Recent Activity</h3>
            {loading ? (
              <div className="empty-dim">Loading…</div>
            ) : activities.length === 0 ? (
              <div className="empty-dim">No activity yet. Events will appear here as they happen.</div>
            ) : (
              <div className="activity-list">
                {activities.map((item) => (
                  <div className="activity-item" key={item.id}>
                    <div className={`icon-box ${item.type}`}>
                      {iconMap[item.type] || <CheckCircle size={18} />}
                    </div>
                    <div className="activity-content">
                      <p className="title">{item.title}</p>
                      <span>{item.subtitle}</span>
                    </div>
                    <div className="time">{formatTime(item.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="side-column">
            <div className="card">
              <h3 className="card-title">System Status</h3>
              <div className="status-row">
                <span>Active Accounts</span>
                <strong className="green">{stats.activeAccounts}</strong>
              </div>
              <div className="status-row">
                <span>Open Issues</span>
                <strong className="red">{stats.openIssues}</strong>
              </div>
              <div className="status-row">
                <span>Monthly Revenue</span>
                <strong className="accent">R{stats.monthlyRevenue.toLocaleString()}</strong>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Quick Actions</h3>
              <button className="ghost-btn" onClick={() => navigate('/admin/accounts')}>+ Add Cashier</button>
              <button className="ghost-btn" onClick={() => navigate('/admin/reports')}>View Reports</button>
              <button className="ghost-btn" onClick={() => navigate('/admin/payments')}>Manage Payments</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}