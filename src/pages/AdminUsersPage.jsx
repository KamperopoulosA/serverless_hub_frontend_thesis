import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState(null);
  const [lastSpanId, setLastSpanId] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);

  const [deployments, setDeployments] = useState([]);
  const [loadingDeployments, setLoadingDeployments] = useState(false);
  const [deploymentsError, setDeploymentsError] = useState(null);

  // 🔹 state για Edit modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    email: "",
    name: "",
    city: "",
    role: "USER",
    newPassword: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data.ourUsersList || []);

    console.log("HEADERS:", res.headers);
    const spanId = res.headers["x-span-id"] || res.headers["x-request-id"];
    console.log("SPAN:", spanId);
    setLastSpanId(spanId || null);
    setCopyStatus(null);
  };

  const loadMetrics = async () => {
    try {
      setLoadingMetrics(true);
      setMetricsError(null);

      const res = await api.get("/observability/summary");
      setMetrics(res.data);
    } catch (e) {
      console.error("Failed to load observability metrics", e);
      setMetricsError("Failed to load metrics");
    } finally {
      setLoadingMetrics(false);
    }
  };

  const loadDeployments = async () => {
    try {
      setLoadingDeployments(true);
      setDeploymentsError(null);

      const res = await api.get("/admin/deployments");
      setDeployments(res.data || []);
    } catch (e) {
      console.error("Failed to load deployments", e);
      setDeploymentsError("Failed to load deployments");
    } finally {
      setLoadingDeployments(false);
    }
  };

  const toggleActive = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;
    await api.delete(`/admin/users/${id}`);
    loadUsers();
  };

  const handleCopySpanId = async () => {
    if (!lastSpanId) return;
    try {
      await navigator.clipboard.writeText(lastSpanId);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (e) {
      console.error("Failed to copy span id", e);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  useEffect(() => {
    loadUsers();
    loadMetrics();
    loadDeployments();
  }, []);

  const getMetricValues = (metricObj) => {
    const count = metricObj?.count ?? 0;
    const mean = metricObj?.meanMs ?? 0;
    const max = metricObj?.maxMs ?? 0;

    return {
      count,
      meanStr:
        typeof mean === "number" ? `${mean.toFixed(1)} ms` : `${mean} ms`,
      maxStr: typeof max === "number" ? `${max.toFixed(1)} ms` : `${max} ms`,
    };
  };

  const endpointRows = [
    {
      label: "GET /api/admin/users",
      key: "admin_users_get",
      spanId: lastSpanId,
      canCopy: true,
    },
    {
      label: "GET /api/platforms",
      key: "platforms_get",
      spanId: lastSpanId,
      canCopy: true,
    },
    {
      label: "GET /api/platforms/search",
      key: "platforms_search_get",
      spanId: null,
    },
    {
      label: "POST /api/deployments",
      key: "deployments_post",
      spanId: null,
    },
    {
      label: "POST /api/auth/login",
      key: "auth_login_post",
      spanId: null,
    },
  ];

  // 🔹 Όταν πατάς Edit σε έναν χρήστη
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || "",
      name: user.name || "",
      city: user.city || "",
      role: user.role || "USER",
      newPassword: "",
    });
    setEditError(null);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditError(null);
    setEditForm({
      email: "",
      name: "",
      city: "",
      role: "USER",
      newPassword: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

    const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditError(null);
    setEditSaving(true);

    try {
      const payload = {
        email: editForm.email,
        name: editForm.name,
        city: editForm.city,
        role: editForm.role,
        password: editForm.newPassword || null, // αν είναι κενό, backend αγνοεί
      };

      // backend: PUT /api/auth/admin/update/{userId}
      await api.put(`/auth/admin/update/${editingUser.id}`, payload);

      await loadUsers();
      handleCloseEdit();
    } catch (err) {
      console.error("Failed to update user", err);
      setEditError("Failed to update user");
    } finally {
      setEditSaving(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Admin – User Management</h1>

      {/* 🔍 Observability / Metrics section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">API Observability</h2>
            <p className="text-xs text-gray-500">
              Overview of key endpoints, performance and last span id (where
              available).
            </p>
          </div>
          <Button size="sm" onClick={loadMetrics}>
            Refresh metrics
          </Button>
        </div>

        {loadingMetrics && (
          <p className="text-sm text-gray-500">Loading metrics…</p>
        )}
        {metricsError && (
          <p className="text-sm text-red-500">{metricsError}</p>
        )}

        {!loadingMetrics && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b font-semibold text-left">
                  <th className="py-2">Endpoint</th>
                  <th className="py-2">Requests</th>
                  <th className="py-2">Mean latency</th>
                  <th className="py-2">Max latency</th>
                  <th className="py-2">Last span id</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {endpointRows.map((row) => {
                  const m = metrics ? metrics[row.key] : null;
                  const { count, meanStr, maxStr } = getMetricValues(m);

                  const hasSpan = !!row.spanId;

                  return (
                    <tr key={row.label} className="border-b">
                      <td className="py-2 pr-4 font-mono text-xs">
                        {row.label}
                      </td>
                      <td className="py-2 pr-4">{count}</td>
                      <td className="py-2 pr-4">{meanStr}</td>
                      <td className="py-2 pr-4">{maxStr}</td>
                      <td className="py-2 pr-4">
                        {hasSpan ? (
                          <span className="px-2 py-1 rounded-full bg-gray-100 text-[11px] font-mono max-w-[260px] inline-block truncate">
                            {row.spanId}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2">
                        {row.canCopy && hasSpan && (
                          <div className="flex items-center gap-2">
                            <Button size="xs" onClick={handleCopySpanId}>
                              Copy span id
                            </Button>
                            {copyStatus === "copied" && (
                              <span className="text-[11px] text-green-600">
                                Copied!
                              </span>
                            )}
                            {copyStatus === "error" && (
                              <span className="text-[11px] text-red-600">
                                Copy failed
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!metrics && !metricsError && !loadingMetrics && (
              <p className="text-sm text-gray-500 mt-2">
                No metrics yet. Hit some endpoints and click “Refresh metrics”.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* 🚀 Deployment records table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Deployments</h2>
          <Button size="sm" onClick={loadDeployments}>
            Refresh
          </Button>
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
                  <th className="py-2">User</th>
                  <th className="py-2">Platform</th>
                  <th className="py-2">Function</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Endpoint</th>
                  <th className="py-2">Created at</th>
                </tr>
              </thead>
              <tbody>
                {deployments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 text-center text-gray-500"
                    >
                      No deployments yet.
                    </td>
                  </tr>
                )}

                {deployments.filter((d) => d.status !== "FAILED").map((d) => (
                  <tr key={d.id} className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs truncate max-w-[140px]">
                      {d.id}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs truncate max-w-[140px]">
                      {d.userId}
                    </td>
                    <td className="py-2 pr-4">{d.platformName || "-"}</td>
                    <td className="py-2 pr-4">{d.functionName}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-semibold
                          ${
                            d.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : d.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {d.status}
                      </span>
                    </td>
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
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 👤 Users table */}
      <Card className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b font-semibold">
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.filter((u) => u.role !== "ADMIN")
            .map((u) => (
              <tr key={u.id} className="border-b">
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.active ? "Active" : "Disabled"}</td>

                <td className="space-x-2 text-right">
                  <Button onClick={() => toggleActive(u.id)} size="sm">
                    {u.active ? "Disable" : "Activate"}
                  </Button>

                  <Button
                    onClick={() => handleOpenEdit(u)}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={() => deleteUser(u.id)}
                    size="sm"
                    className="bg-red-600"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ✏️ Edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit user #{editingUser.id}
            </h2>

            {editError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  name="city"
                  type="text"
                  value={editForm.city}
                  onChange={handleEditChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Role (read-only)
                </label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  disabled
                    className="w-full border rounded-md px-3 py-2 text-sm 
             bg-gray-100 text-gray-500 cursor-not-allowed"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  New password (optional)
                </label>
                <input
                  name="newPassword"
                  type="password"
                  value={editForm.newPassword}
                  onChange={handleEditChange}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-gray-500">
                  Leave empty to keep existing password.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={handleCloseEdit}
                  disabled={editSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
