import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        <Settings size={32} />
      </div>
      <h2 className="placeholder-title">Settings</h2>
      <p className="placeholder-description">
        Configure system parameters, notification preferences, and user
        management for your smart grid platform.
      </p>
      <span className="placeholder-badge">Coming in Phase 2</span>
    </div>
  );
}
