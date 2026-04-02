import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const ProfilePage = () => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    city: "",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 🔹 Deployments state
  const [deployments, setDeployments] = useState([]);
  const [loadingDeployments, setLoadingDeployments] = useState(false);
  const [deploymentsError, setDeploymentsError] = useState(null);

  // ✅ Hide FAILED deployments by default (toggle)
  const [showFailedDeployments, setShowFailedDeployments] = useState(false);

  // Φόρτωση προφίλ στην αρχή
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // backend: /api/auth/adminuser/get-profile
      const res = await api.get("/auth/adminuser/get-profile");
      const u = res.data.ourUsers || {};

      setForm((prev) => ({
        ...prev,
        email: u.email || "",
        name: u.name || "",
        city: u.city || "",
        role: u.role || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (e) {
      console.error("Failed to load profile", e);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Φόρτωση deployments χρήστη
  const loadDeployments = async () => {
    try {
      setLoadingDeployments(true);
      setDeploymentsError(null);

      // backend: GET /api/user/deployments/my
      const res = await api.get("/user/deployments/my");
      setDeployments(res.data || []);
    } catch (e) {
      console.error("Failed to load deployments", e);
      setDeploymentsError("Failed to load deployments");
    } finally {
      setLoadingDeployments(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadDeployments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // basic front-end validation για password change
    if (form.newPassword) {
      if (!form.currentPassword) {
        setError("Please enter your current password to change it.");
        return;
      }
      if (form.newPassword !== form.confirmNewPassword) {
        setError("New password and confirmation do not match.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        email: form.email,
        name: form.name,
        city: form.city,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null,
      };

      // backend: PUT /api/auth/profile
      const res = await api.put("/auth/profile", payload);

      if (res.data?.statusCode && res.data.statusCode >= 400) {
        setError(res.data.message || "Failed to update profile.");
      } else {
        setSuccess("Profile updated successfully.");

        // Καθάρισμα password fields
        setForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
      }
    } catch (e) {
      console.error("Failed to update profile", e);
      setError("Unexpected error while updating profile.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Sort deployments by createdAt DESC (most recent first)
  const sortedDeployments = useMemo(() => {
    const arr = Array.isArray(deployments) ? [...deployments] : [];
    arr.sort((a, b) => {
      const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });
    return arr;
  }, [deployments]);

  // ✅ Most recent deployment (status-only view)
  const mostRecentDeployment =
    sortedDeployments.length > 0 ? sortedDeployments[0] : null;

  // ✅ Visible deployments for table (hide FAILED by default)
  const tableDeployments = useMemo(() => {
    if (showFailedDeployments) return sortedDeployments;
    return sortedDeployments.filter(
      (d) => (d?.status || "").toUpperCase() !== "FAILED"
    );
  }, [sortedDeployments, showFailedDeployments]);

  const renderStatusBadge = (statusRaw) => {
    const status = (statusRaw || "").toUpperCase();
    const cls =
      status === "SUCCESS"
        ? "bg-green-100 text-green-700"
        : status === "FAILED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

    return (
      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
        {status || "UNKNOWN"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-sm text-gray-500 mb-4">
        View and update your account details.
      </p>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      {/* 🧍‍♂️ Profile form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Βασικές πληροφορίες */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Account info</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 inline-block">
              {form.role || "USER"}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Αλλαγή password */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Change password</h2>
          <p className="text-xs text-gray-500 mb-2">
            Leave the fields empty if you do not want to change your password.
          </p>

          <div className="space-y-1">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={form.confirmNewPassword}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>

      {/* ✅ Most Recent Deployment (read-only status view) */}
      <Card id="recent" className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Most Recent Deployment</h2>
            <p className="text-xs text-gray-500 mt-1">
              Read-only status view of your latest deployment attempt.
            </p>
          </div>

          <Button size="sm" onClick={loadDeployments} disabled={loadingDeployments}>
            {loadingDeployments ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {deploymentsError && (
          <p className="text-sm text-red-500 mt-3">{deploymentsError}</p>
        )}

        {!deploymentsError && !mostRecentDeployment && (
          <p className="text-sm text-gray-500 mt-3">No deployments yet.</p>
        )}

        {mostRecentDeployment && (
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="text-gray-600">Status</div>
              <div>{renderStatusBadge(mostRecentDeployment.status)}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Platform</div>
              <div className="font-medium">
                {mostRecentDeployment.platformName || "-"}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Function</div>
              <div className="font-medium">{mostRecentDeployment.functionName || "-"}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Created at</div>
              <div className="text-gray-700">
                {mostRecentDeployment.createdAt
                  ? new Date(mostRecentDeployment.createdAt).toLocaleString()
                  : "-"}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Endpoint</div>
              <div className="text-right">
                {mostRecentDeployment.endpointUrl ? (
                  <a
                    href={mostRecentDeployment.endpointUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-xs break-all"
                  >
                    {mostRecentDeployment.endpointUrl}
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 🚀 Deployments του χρήστη */}
      <Card className="p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Deployments</h2>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-600 flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFailedDeployments}
                onChange={(e) => setShowFailedDeployments(e.target.checked)}
              />
              Show failed
            </label>
          </div>
        </div>

        {loadingDeployments && (
          <p className="text-sm text-gray-500">Loading deployments…</p>
        )}
        {deploymentsError && (
          <p className="text-sm text-red-500">{deploymentsError}</p>
        )}

        {!loadingDeployments && !deploymentsError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b font-semibold text-left">
                  <th className="py-2">ID</th>
                  <th className="py-2">Platform</th>
                  <th className="py-2">Function</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Endpoint</th>
                  <th className="py-2">Created at</th>
                </tr>
              </thead>

              <tbody>
                {tableDeployments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      {deployments.length === 0
                        ? "No deployments yet."
                        : showFailedDeployments
                        ? "No deployments to show."
                        : "No successful/pending deployments to show (failed are hidden)."}
                    </td>
                  </tr>
                )}

                {tableDeployments.map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs truncate max-w-[140px]">
                      {d.id}
                    </td>
                    <td className="py-2 pr-4">{d.platformName || "-"}</td>
                    <td className="py-2 pr-4">{d.functionName}</td>
                    <td className="py-2 pr-4">{renderStatusBadge(d.status)}</td>
                    <td className="py-2 pr-4">
                      {d.endpointUrl ? (
                        <a
                          href={d.endpointUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-xs break-all"
                        >
                          {d.endpointUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-600">
                      {d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
