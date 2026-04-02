import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center text-xs font-semibold tracking-wide text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            Platform Hub · Multi-Cloud Platform Selector
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Choose the best{" "}
            <span className="text-blue-600">serverless platform</span> and deploy
            in minutes.
          </h1>

          <p className="text-gray-600 text-sm sm:text-base max-w-xl">
            Compare AWS, GCP and Azure serverless offerings, see key KPIs and
            deploy your functions directly from a single unified dashboard.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/login">
              <Button size="lg">Get started</Button>
            </Link>
            <Link to="/platforms">
              <Button variant="outline" size="lg">
                Browse platforms
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live metrics & observability
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Multi-cloud ready
            </div>
          </div>
        </div>

        {/* Simple “mock” dashboard preview */}
        <div className="flex-1 w-full">
          <Card className="p-5 shadow-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-slate-800">
                Overview
              </h2>
              <span className="text-[11px] text-gray-400">
                Demo preview
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 rounded-xl px-3 py-3">
                <p className="text-[11px] text-gray-500 mb-1">
                  Active platforms
                </p>
                <p className="text-lg font-semibold">3</p>
                <p className="text-[11px] text-emerald-600">AWS · GCP · Azure</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-3">
                <p className="text-[11px] text-gray-500 mb-1">
                  Recent deployments
                </p>
                <p className="text-lg font-semibold">12</p>
                <p className="text-[11px] text-blue-600">Last 24 hours</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-3">
                <p className="text-[11px] text-gray-500 mb-1">
                  Avg latency
                </p>
                <p className="text-lg font-semibold">145 ms</p>
                <p className="text-[11px] text-amber-600">all providers</p>
              </div>
            </div>

            <div className="mt-5 border-t pt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Quick links
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to="/deployments">
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 cursor-pointer">
                    View my deployments
                  </span>
                </Link>
                <Link to="/profile">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 cursor-pointer">
                    Edit profile
                  </span>
                </Link>
                <Link to="/admin">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 cursor-pointer">
                    Admin dashboard
                  </span>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 pb-16 space-y-8">
        <h2 className="text-2xl font-bold">Why Serverless Hub?</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 space-y-2">
            <h3 className="font-semibold text-sm">Platform comparison</h3>
            <p className="text-xs text-gray-600">
              Filter and compare AWS, GCP and Azure serverless services using
              KPIs like cold start, pricing, runtime support and regional
              availability.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <h3 className="font-semibold text-sm">One-click deployments</h3>
            <p className="text-xs text-gray-600">
              Upload your function package, select a platform and let the
              backend handle configuration and deployment for you.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <h3 className="font-semibold text-sm">Observability built-in</h3>
            <p className="text-xs text-gray-600">
              Track request counts, latency and deployment history from the
              admin dashboard and your personal profile page.
            </p>
          </Card>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              Ready to explore serverless platforms?
            </h3>
            <p className="text-sm text-gray-600">
              Create an account, save your deployments and monitor everything
              from one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/register">
              <Button>Sign up</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
