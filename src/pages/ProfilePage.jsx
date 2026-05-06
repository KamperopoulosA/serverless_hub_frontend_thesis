import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const ACTIVE_DEPLOYMENT_STATUSES = new Set(['QUEUED', 'RUNNING']);

const ProfilePage = () => {
  const [form, setForm] = useState({
    email: '',
    name: '',
    city: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [deployments, setDeployments] = useState([]);
  const [loadingDeployments, setLoadingDeployments] = useState(false);
  const [deploymentsError, setDeploymentsError] = useState(null);
  const [showFailedDeployments, setShowFailedDeployments] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/auth/adminuser/get-profile');
      const user = response.data.ourUsers || {};

      setForm((previous) => ({
        ...previous,
        email: user.email || '',
        name: user.name || '',
        city: user.city || '',
        role: user.role || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (requestError) {
      console.error('Failed to load profile', requestError);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const loadDeployments = async () => {
    try {
      setLoadingDeployments(true);
      setDeploymentsError(null);
      const response = await api.get('/user/deployments/my');
      setDeployments(response.data || []);
    } catch (requestError) {
      console.error('Failed to load deployments', requestError);
      setDeploymentsError('Failed to load deployments.');
    } finally {
      setLoadingDeployments(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadDeployments();
  }, []);

  const hasActiveDeployments = useMemo(
    () =>
      deployments.some((deployment) =>
        ACTIVE_DEPLOYMENT_STATUSES.has((deployment.status || '').toUpperCase())
      ),
    [deployments]
  );

  useEffect(() => {
    if (!hasActiveDeployments) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadDeployments();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [hasActiveDeployments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.newPassword) {
      if (!form.currentPassword) {
        setError('Please enter your current password to change it.');
        return;
      }

      if (form.newPassword !== form.confirmNewPassword) {
        setError('New password and confirmation do not match.');
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

      const response = await api.put('/auth/profile', payload);
      if (response.data?.statusCode && response.data.statusCode >= 400) {
        setError(response.data.message || 'Failed to update profile.');
      } else {
        setSuccess('Profile updated successfully.');
        setForm((previous) => ({
          ...previous,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
      }
    } catch (requestError) {
      console.error('Failed to update profile', requestError);
      setError('Unexpected error while updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const sortedDeployments = useMemo(() => {
    const records = Array.isArray(deployments) ? [...deployments] : [];
    records.sort((left, right) => {
      const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
    });
    return records;
  }, [deployments]);

  const mostRecentDeployment = sortedDeployments.length > 0 ? sortedDeployments[0] : null;
  const tableDeployments = useMemo(() => {
    if (showFailedDeployments) {
      return sortedDeployments;
    }

    return sortedDeployments.filter(
      (deployment) => (deployment?.status || '').toUpperCase() !== 'FAILED'
    );
  }, [showFailedDeployments, sortedDeployments]);

  const renderStatusBadge = (statusRaw) => {
    const status = (statusRaw || '').toUpperCase();
    const badgeClass =
      status === 'SUCCESS'
        ? 'bg-green-100 text-green-700'
        : status === 'FAILED'
        ? 'bg-red-100 text-red-700'
        : status === 'RUNNING'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-yellow-100 text-yellow-700';

    return (
      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${badgeClass}`}>
        {status || 'UNKNOWN'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      <p className="text-sm text-gray-500 mb-4">View and update your account details.</p>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Account Info</h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 inline-block">
              {form.role || 'USER'}
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
              Full Name
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

        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Change Password</h2>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Card id="recent" className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Most Recent Deployment</h2>
            <p className="text-xs text-gray-500 mt-1">
              {hasActiveDeployments
                ? 'This view auto-refreshes while deployments are queued or running.'
                : 'Read-only status view of your latest deployment attempt.'}
            </p>
          </div>

          <Button size="sm" onClick={loadDeployments} disabled={loadingDeployments}>
            {loadingDeployments ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {deploymentsError && <p className="text-sm text-red-500 mt-3">{deploymentsError}</p>}

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
              <div className="font-medium">{mostRecentDeployment.platformName || '-'}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Provider</div>
              <div className="font-medium">{mostRecentDeployment.provider || '-'}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Function</div>
              <div className="font-medium">{mostRecentDeployment.functionName || '-'}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-gray-600">Created at</div>
              <div className="text-gray-700">
                {mostRecentDeployment.createdAt
                  ? new Date(mostRecentDeployment.createdAt).toLocaleString()
                  : '-'}
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

            {mostRecentDeployment.errorMessage && (
              <div className="mt-2 text-sm text-red-600">{mostRecentDeployment.errorMessage}</div>
            )}
          </div>
        )}
      </Card>

      <Card className="p-6 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Deployments</h2>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-600 flex items-center gap-2">
              <input
                type="checkbox"
                checked={showFailedDeployments}
                onChange={(event) => setShowFailedDeployments(event.target.checked)}
              />
              Show failed
            </label>
          </div>
        </div>

        {loadingDeployments && <p className="text-sm text-gray-500">Loading deployments...</p>}
        {deploymentsError && <p className="text-sm text-red-500">{deploymentsError}</p>}

        {!loadingDeployments && !deploymentsError && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b font-semibold text-left">
                  <th className="py-2">ID</th>
                  <th className="py-2">Platform</th>
                  <th className="py-2">Provider</th>
                  <th className="py-2">Function</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Endpoint</th>
                  <th className="py-2">Created at</th>
                </tr>
              </thead>

              <tbody>
                {tableDeployments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      {deployments.length === 0
                        ? 'No deployments yet.'
                        : showFailedDeployments
                        ? 'No deployments to show.'
                        : 'No successful or active deployments to show (failed are hidden).'}
                    </td>
                  </tr>
                )}

                {tableDeployments.map((deployment) => (
                  <tr key={deployment.id} className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs truncate max-w-[140px]">
                      {deployment.id}
                    </td>
                    <td className="py-2 pr-4">{deployment.platformName || '-'}</td>
                    <td className="py-2 pr-4">{deployment.provider || '-'}</td>
                    <td className="py-2 pr-4">{deployment.functionName}</td>
                    <td className="py-2 pr-4">{renderStatusBadge(deployment.status)}</td>
                    <td className="py-2 pr-4">
                      {deployment.endpointUrl ? (
                        <a
                          href={deployment.endpointUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-xs break-all"
                        >
                          {deployment.endpointUrl}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-xs text-gray-600">
                      {deployment.createdAt ? new Date(deployment.createdAt).toLocaleString() : '-'}
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
