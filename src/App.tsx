import { useState, useMemo } from "react";
import {
  NepalNaksha,
  DISTRICTS,
  PROVINCE_NAMES,
  PROVINCES,
  getDistrictInfo,
  getDistrictsByProvince,
  type ValidDistrict,
  type DistrictInfo,
  type NepalNakshaColors,
  type NepalNakshaRoute,
} from "nepal-naksha-react";

// Mock branch offices data for branch mode
interface BranchItem {
  place: string;
  offices: number;
  manager: string;
  status: string;
}

const SAMPLE_BRANCHES: BranchItem[] = [
  { place: "Kathmandu", offices: 14, manager: "Aarav Sharma", status: "Hub" },
  { place: "Lalitpur", offices: 6, manager: "Prerana Thapa", status: "Branch" },
  { place: "Bhaktapur", offices: 3, manager: "Sujan Shrestha", status: "Branch" },
  { place: "Kaski", offices: 8, manager: "Bikash Gurung", status: "Regional HQ" },
  { place: "Chitwan", offices: 7, manager: "Dipak Adhikari", status: "Branch" },
  { place: "Morang", offices: 9, manager: "Sunita Karki", status: "Regional HQ" },
  { place: "Jhapa", offices: 5, manager: "Nabin Poudel", status: "Branch" },
  { place: "Rupandehi", offices: 8, manager: "Kiran Chaudhary", status: "Regional HQ" },
  { place: "Banke", offices: 4, manager: "Manoj Yadav", status: "Branch" },
  { place: "Kailali", offices: 5, manager: "Ramesh Joshi", status: "Regional HQ" },
  { place: "Parsa", offices: 6, manager: "Amit Patel", status: "Trade Hub" },
  { place: "Dhanusha", offices: 4, manager: "Pooja Shah", status: "Branch" },
  { place: "Sunsari", offices: 4, manager: "Roshan Giri", status: "Branch" },
  { place: "Surkhet", offices: 3, manager: "Ganesh Rawat", status: "Branch" },
];

// Mock population data for choropleth mode
const POPULATION_LEVELS: Record<string, string> = {
  Kathmandu: "#b91c1c",
  Morang: "#c2410c",
  Rupandehi: "#c2410c",
  Jhapa: "#d97706",
  Kailali: "#d97706",
  Sunsari: "#d97706",
  Dhanusha: "#d97706",
  Kaski: "#ca8a04",
  Chitwan: "#ca8a04",
  Sarlahi: "#ca8a04",
  Siraha: "#ca8a04",
  Mahottari: "#ca8a04",
  Bara: "#ca8a04",
  Rautahat: "#ca8a04",
  Parsa: "#ca8a04",
  Kanchanpur: "#65a30d",
  Banke: "#65a30d",
  Bardiya: "#65a30d",
  Dang: "#65a30d",
  Lalitpur: "#65a30d",
  Kavrepalanchok: "#16a34a",
  Tanahun: "#16a34a",
  Nawalpur: "#16a34a",
  Parasi: "#16a34a",
  Surkhet: "#16a34a",
  Dhading: "#16a34a",
  Makwanpur: "#16a34a",
  Gorkha: "#0d9488",
  Sindhupalchok: "#0d9488",
  Baglung: "#0d9488",
  Palpa: "#0d9488",
  Ilam: "#0d9488",
  Gulmi: "#0d9488",
  Dolpa: "#0284c7",
  Humla: "#0284c7",
  Mugu: "#0284c7",
  Mustang: "#0284c7",
  Manang: "#0284c7",
};

const DELIVERY_ROUTES: NepalNakshaRoute[] = [
  { name: "Central Hub", source: "Kathmandu", destination: "Chitwan", color: "#f97316", width: 3 },
  { name: "Eastern Run", source: "Kathmandu", destination: "Jhapa", color: "#facc15", width: 2.5 },
  { name: "Western Run", source: "Kathmandu", destination: "Kailali", color: "#22d3ee", width: 2.5 },
];

const THEMES: Record<string, { name: string; colors: NepalNakshaColors }> = {
  crimson: {
    name: "Nepal Crimson",
    colors: {
      base: "#1e293b",
      active: "#dc2626",
      selected: "#991b1b",
      hover: "#f87171",
      stroke: "#0f172a",
      selectedStroke: "#ffffff",
      selectedGlow: "rgba(239, 68, 68, 0.6)",
    },
  },
  blue: {
    name: "Modern Ocean",
    colors: {
      base: "#1e293b",
      active: "#0284c7",
      selected: "#38bdf8",
      hover: "#7dd3fc",
      stroke: "#0f172a",
      selectedStroke: "#ffffff",
      selectedGlow: "rgba(56, 189, 248, 0.6)",
    },
  },
  emerald: {
    name: "Himalayan Forest",
    colors: {
      base: "#1e293b",
      active: "#059669",
      selected: "#34d399",
      hover: "#6ee7b7",
      stroke: "#0f172a",
      selectedStroke: "#ffffff",
      selectedGlow: "rgba(52, 211, 153, 0.6)",
    },
  },
  indigo: {
    name: "Midnight Indigo",
    colors: {
      base: "#1e293b",
      active: "#6366f1",
      selected: "#a855f7",
      hover: "#c084fc",
      stroke: "#0f172a",
      selectedStroke: "#ffffff",
      selectedGlow: "rgba(168, 85, 247, 0.6)",
    },
  },
};

export default function App() {
  const [mode, setMode] = useState<"picker" | "branches" | "choropleth" | "province" | "routes">("routes");
  const [selectedDistrict, setSelectedDistrict] = useState<ValidDistrict | null>("Kathmandu");
  const [selectedMeta, setSelectedMeta] = useState<DistrictInfo | null>(getDistrictInfo("Kathmandu"));
  const [language, setLanguage] = useState<"en" | "ne">("en");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [labelMode, setLabelMode] = useState<boolean | "active" | "hover">(false);
  const [activeTheme, setActiveTheme] = useState<string>("indigo");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [deliveryRoutes, setDeliveryRoutes] = useState<NepalNakshaRoute[]>(DELIVERY_ROUTES);
  const [routeSource, setRouteSource] = useState<ValidDistrict>("Kathmandu");
  const [routeDestination, setRouteDestination] = useState<ValidDistrict>("Chitwan");
  const [routeName, setRouteName] = useState("New delivery route");
  const [routeColor, setRouteColor] = useState("#fb7185");

  const colors = THEMES[activeTheme].colors;
  const routeDistricts = useMemo(
    () =>
      Array.from(
        new Set(
          deliveryRoutes.flatMap((route) =>
            [route.source, route.destination].filter((point): point is ValidDistrict => typeof point === "string")
          )
        )
      ),
    [deliveryRoutes]
  );

  // Handle district selection
  const handleSelect = (district: ValidDistrict, meta: DistrictInfo) => {
    setSelectedDistrict(district);
    setSelectedMeta(meta);
  };

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return DISTRICTS.filter((d: string) => {
      const info = getDistrictInfo(d);
      if (!info) return false;
      return (
        d.toLowerCase().includes(q) ||
        info.nepali.includes(q) ||
        info.headquarters.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [searchQuery]);

  const handleSearchResultClick = (d: ValidDistrict) => {
    const info = getDistrictInfo(d);
    if (info) {
      setSelectedDistrict(d);
      setSelectedMeta(info);
      setSearchQuery("");
    }
  };

  // Code snippet string generator
  const generatedCode = useMemo(() => {
    if (mode === "branches") {
      return `import { NepalNaksha } from "nepal-naksha-react";

export default function StoreMap() {
  const branches = ${JSON.stringify(
    SAMPLE_BRANCHES.slice(0, 4).map((b) => ({ place: b.place, offices: b.offices })),
    null,
    2
  )};

  return (
    <NepalNaksha
      items={branches}
      language="${language}"
      colors={{ active: "${colors.active}", selected: "${colors.selected}" }}
      onSelect={(district, meta) => console.log(district, meta)}
    />
  );
}`;
    }

    if (mode === "province") {
      return `import { NepalNaksha } from "nepal-naksha-react";

export default function ProvinceView() {
  return (
    <NepalNaksha
      filterProvince="${selectedProvince === "All" ? "Bagmati" : selectedProvince}"
      language="${language}"
      showLabels={true}
    />
  );
}`;
    }

    if (mode === "choropleth") {
      return `import { NepalNaksha } from "nepal-naksha-react";

const density: Record<string, string> = {
  Kathmandu: "#b91c1c",
  Morang: "#c2410c",
  Jhapa: "#d97706",
  Kaski: "#ca8a04",
};

export default function Heatmap() {
  return (
    <NepalNaksha
      choropleth={(district) => density[district] || "#1e293b"}
      language="${language}"
    />
  );
}`;
    }

    if (mode === "routes") {
      return `import { NepalNaksha, type NepalNakshaRoute } from "nepal-naksha-react";

const routes: NepalNakshaRoute[] = ${JSON.stringify(
        deliveryRoutes.map(({ name, source, destination, color, width }) => ({
          name,
          source,
          destination,
          color,
          width,
        })),
        null,
        2
      )};

export default function DeliveryMap() {
  return (
    <NepalNaksha
      routes={routes}
      language="${language}"
      showLabels={${labelMode === true ? "true" : labelMode ? `"${labelMode}"` : "false"}}
    />
  );
}`;
    }

    return `import { useState } from "react";
import { NepalNaksha, type ValidDistrict } from "nepal-naksha-react";

export default function App() {
  const [district, setDistrict] = useState<ValidDistrict | null>("Kathmandu");

  return (
    <NepalNaksha
      value={district}
      language="${language}"
      showLabels={${labelMode === true ? "true" : labelMode ? `"${labelMode}"` : "false"}}
      onSelect={(name, meta) => setDistrict(name)}
    />
  );
}`;
  }, [mode, language, labelMode, colors, selectedProvince, deliveryRoutes]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 20px 60px" }}>
      {/* Top Header */}
      <header style={{ marginBottom: "32px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(220, 38, 38, 0.12)", border: "1px solid rgba(220, 38, 38, 0.3)", padding: "4px 14px", borderRadius: "999px", fontSize: "13px", color: "#f87171", marginBottom: "14px" }}>
          <span>🇳🇵</span> Official 77 Districts & 7 Provinces • Zero Dependencies
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.02em", color: "#ffffff", marginBottom: "10px" }}>
          Nepal Naksha <span style={{ color: "#ef4444" }}>Interactive Map</span>
        </h1>
        <p style={{ fontSize: "16px", color: "#94a3b8", maxWidth: "680px", margin: "0 auto" }}>
          Lightweight, customizable React component rendering sharp SVG maps of Nepal with English & Devanagari support, headquarters metadata, and alias matching.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
          <a
            href="https://github.com/dhlpradip/nepal-naksha"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#cbd5e1", border: "1px solid #334155", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", textDecoration: "none" }}
          >
            ◇ GitHub package
          </a>
          <a
            href="https://www.npmjs.com/package/nepal-naksha-react"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#cbd5e1", border: "1px solid #334155", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", textDecoration: "none" }}
          >
            ◉ npm package
          </a>
        </div>
      </header>

      {/* Main Grid: Controls + Map + Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Navigation / Mode Switcher Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "8px 12px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {[
              { id: "picker", label: "📍 District Explorer" },
              { id: "branches", label: "🏢 Coverage / Branches" },
              { id: "choropleth", label: "📊 Heatmap / Choropleth" },
              { id: "province", label: "🏛️ Province Filter" },
              { id: "routes", label: "🚚 Delivery Routes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as any)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                  background: mode === tab.id ? "#ef4444" : "transparent",
                  color: mode === tab.id ? "#ffffff" : "#94a3b8",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <input
              type="text"
              placeholder="Search district (e.g. Pokhara, काठमाडौं, Tanahu)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#1f2937",
                border: "1px solid #374151",
                color: "#ffffff",
                fontSize: "13px",
                outline: "none",
              }}
            />
            {searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: "4px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  zIndex: 100,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  overflow: "hidden",
                }}
              >
                {searchResults.map((d: ValidDistrict) => {
                  const info = getDistrictInfo(d);
                  return (
                    <div
                      key={d}
                      onClick={() => handleSearchResultClick(d)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #334155",
                        fontSize: "13px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#334155")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "transparent")}
                    >
                      <span>
                        <strong>{d}</strong> <span style={{ opacity: 0.7 }}>({info?.nepali})</span>
                      </span>
                      <span style={{ fontSize: "11px", opacity: 0.6 }}>{info?.provinceName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "10px 16px", fontSize: "13px" }}>
          {/* Language Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Language:</span>
            <div style={{ display: "flex", background: "#1f2937", borderRadius: "6px", padding: "2px" }}>
              <button
                onClick={() => setLanguage("en")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: language === "en" ? "#ef4444" : "transparent",
                  color: language === "en" ? "#ffffff" : "#94a3b8",
                }}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setLanguage("ne")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: language === "ne" ? "#ef4444" : "transparent",
                  color: language === "ne" ? "#ffffff" : "#94a3b8",
                }}
              >
                🇳🇵 नेपाली
              </button>
            </div>
          </div>

          {/* Theme Switch */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Theme:</span>
            <select
              value={activeTheme}
              onChange={(e) => setActiveTheme(e.target.value)}
              style={{
                background: "#1f2937",
                color: "#ffffff",
                border: "1px solid #374151",
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                outline: "none",
              }}
            >
              {Object.entries(THEMES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Label Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#94a3b8" }}>Labels:</span>
            <div style={{ display: "flex", background: "#1f2937", borderRadius: "6px", padding: "2px" }}>
              {[
                { id: false, label: "Off" },
                { id: true, label: "All" },
                { id: "active", label: "Active" },
                { id: "hover", label: "Hover" },
              ].map((opt) => (
                <button
                  key={String(opt.id)}
                  onClick={() => setLabelMode(opt.id as any)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: labelMode === opt.id ? "#374151" : "transparent",
                    color: labelMode === opt.id ? "#ffffff" : "#94a3b8",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Province Filter Dropdown (if in province mode or quick filter) */}
          {mode === "province" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#94a3b8" }}>Select Province:</span>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                style={{
                  background: "#1f2937",
                  color: "#ffffff",
                  border: "1px solid #374151",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                <option value="All">All 7 Provinces</option>
                {PROVINCE_NAMES.map((p: string, idx: number) => (
                  <option key={p} value={p}>
                    {idx + 1}. {p} ({PROVINCES[idx + 1]?.nepali})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {mode === "routes" && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "end",
              gap: "12px",
              background: "#111827",
              border: "1px solid #1f2937",
              borderRadius: "12px",
              padding: "14px 16px",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#94a3b8", fontSize: "12px" }}>
              From
              <select
                value={routeSource}
                onChange={(event) => setRouteSource(event.target.value as ValidDistrict)}
                style={{ minWidth: "150px", padding: "8px", borderRadius: "7px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
              >
                {DISTRICTS.map((district) => <option key={district}>{district}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#94a3b8", fontSize: "12px" }}>
              To
              <select
                value={routeDestination}
                onChange={(event) => setRouteDestination(event.target.value as ValidDistrict)}
                style={{ minWidth: "150px", padding: "8px", borderRadius: "7px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
              >
                {DISTRICTS.map((district) => <option key={district}>{district}</option>)}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#94a3b8", fontSize: "12px" }}>
              Route name
              <input
                value={routeName}
                onChange={(event) => setRouteName(event.target.value)}
                placeholder="e.g. Western delivery"
                style={{ width: "190px", padding: "8px", borderRadius: "7px", background: "#1f2937", border: "1px solid #374151", color: "#fff" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#94a3b8", fontSize: "12px" }}>
              Color
              <input
                type="color"
                value={routeColor}
                onChange={(event) => setRouteColor(event.target.value)}
                style={{ width: "48px", height: "35px", padding: "2px", borderRadius: "7px", background: "#1f2937", border: "1px solid #374151", cursor: "pointer" }}
              />
            </label>
            <button
              onClick={() => {
                if (routeSource === routeDestination) return;
                setDeliveryRoutes((routes) => [
                  ...routes,
                  {
                    name: routeName.trim() || `${routeSource} to ${routeDestination}`,
                    source: routeSource,
                    destination: routeDestination,
                    color: routeColor,
                    width: 2.5,
                  },
                ]);
              }}
              disabled={routeSource === routeDestination}
              style={{
                padding: "9px 14px",
                borderRadius: "7px",
                background: routeSource === routeDestination ? "#374151" : "#ef4444",
                color: "#fff",
                fontWeight: 700,
                opacity: routeSource === routeDestination ? 0.6 : 1,
              }}
            >
              + Add route
            </button>
            <div style={{ flexBasis: "100%", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {deliveryRoutes.map((route, index) => (
                <button
                  key={`${route.name}-${index}`}
                  onClick={() => setDeliveryRoutes((routes) => routes.filter((_, routeIndex) => routeIndex !== index))}
                  title="Remove route"
                  style={{ padding: "5px 9px", borderRadius: "999px", background: "#1f2937", border: `1px solid ${route.color ?? "#64748b"}`, color: "#e2e8f0", fontSize: "11px" }}
                >
                  <span style={{ color: route.color }}>●</span> {route.name}: {route.source} → {route.destination} ×
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map Container + Inspector Panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px" }}>
          {/* SVG Map Card */}
          <div
            style={{
              background: "linear-gradient(180deg, #111827 0%, #0d131f 100%)",
              border: "1px solid #1f2937",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "480px",
              position: "relative",
            }}
          >
            {mode === "picker" && (
              <NepalNaksha
                value={selectedDistrict}
                onSelect={handleSelect}
                language={language}
                showLabels={labelMode}
                colors={colors}
              />
            )}

            {mode === "branches" && (
              <NepalNaksha
                items={SAMPLE_BRANCHES}
                value={selectedDistrict}
                onSelect={handleSelect}
                language={language}
                showLabels={labelMode}
                colors={colors}
                renderTooltip={(_district: ValidDistrict, meta: DistrictInfo, item?: any) => (
                  <div
                    style={{
                      background: "rgba(15, 23, 42, 0.95)",
                      backdropFilter: "blur(8px)",
                      color: "#ffffff",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>
                      {language === "ne" ? meta.nepali : meta.name}
                    </div>
                    {item ? (
                      <div style={{ color: "#38bdf8", fontWeight: 600, marginTop: "2px" }}>
                        🏢 {String(item.offices)} Offices • {String(item.status)}
                      </div>
                    ) : (
                      <div style={{ opacity: 0.6, fontSize: "11px" }}>No branches active</div>
                    )}
                  </div>
                )}
              />
            )}

            {mode === "choropleth" && (
              <NepalNaksha
                value={selectedDistrict}
                onSelect={handleSelect}
                language={language}
                showLabels={labelMode}
                colors={colors}
                choropleth={(d: string) => POPULATION_LEVELS[d] || "#1e293b"}
              />
            )}

            {mode === "province" && (
              <NepalNaksha
                filterProvince={selectedProvince === "All" ? null : selectedProvince}
                value={selectedDistrict}
                onSelect={handleSelect}
                language={language}
                showLabels={labelMode}
                colors={colors}
              />
            )}

            {mode === "routes" && (
              <NepalNaksha
                items={routeDistricts}
                value={null}
                language={language}
                showLabels={labelMode}
                colors={colors}
                routes={deliveryRoutes}
              />
            )}

            {/* Map Legend Overlay */}
            {mode === "choropleth" && (
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  background: "rgba(17, 24, 39, 0.85)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>Low</span>
                <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#0284c7", borderRadius: "2px" }} />
                <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#0d9488", borderRadius: "2px" }} />
                <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#16a34a", borderRadius: "2px" }} />
                <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#ca8a04", borderRadius: "2px" }} />
                <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#d97706", borderRadius: "2px" }} />
                <span style={{ display: "inline-block", width: "12px", height: "12px", background: "#b91c1c", borderRadius: "2px" }} />
                <span>High Density</span>
              </div>
            )}
          </div>

          {/* Right Inspector Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "routes" ? (
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                  Delivery routes
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.5 }}>
                  Route endpoints are highlighted on the map. Hover a route to reveal its name.
                </p>
              </div>
            ) : selectedMeta ? (
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff" }}>
                      {language === "ne" ? selectedMeta.nepali : selectedMeta.name}
                    </h2>
                    <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                      {language === "ne" ? selectedMeta.name : selectedMeta.nepali}
                    </div>
                  </div>
                  <span
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#ef4444",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    PROVINCE {selectedMeta.provinceId}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", fontSize: "13px", marginTop: "16px" }}>
                  <div style={{ background: "#1f2937", padding: "10px 14px", borderRadius: "8px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>Headquarters</div>
                    <div style={{ fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
                      🏛️ {selectedMeta.headquarters}
                    </div>
                  </div>

                  <div style={{ background: "#1f2937", padding: "10px 14px", borderRadius: "8px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>Province</div>
                    <div style={{ fontWeight: 600, color: "#ffffff", marginTop: "2px" }}>
                      📍 {selectedMeta.provinceName} ({selectedMeta.provinceNepali})
                    </div>
                  </div>

                  <div style={{ background: "#1f2937", padding: "10px 14px", borderRadius: "8px" }}>
                    <div style={{ color: "#94a3b8", fontSize: "11px" }}>Centroid Coordinates (SVG)</div>
                    <div style={{ fontWeight: 600, color: "#ffffff", marginTop: "2px", fontFamily: "monospace" }}>
                      X: {selectedMeta.center[0]}, Y: {selectedMeta.center[1]}
                    </div>
                  </div>

                  {mode === "branches" && (
                    <div style={{ background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.3)", padding: "10px 14px", borderRadius: "8px" }}>
                      {(() => {
                        const b = SAMPLE_BRANCHES.find((item) => item.place === selectedDistrict);
                        if (!b) return <span style={{ color: "#94a3b8" }}>No branch established in this district</span>;
                        return (
                          <div>
                            <div style={{ color: "#38bdf8", fontWeight: 700 }}>🏢 Active Branch Network</div>
                            <div style={{ marginTop: "4px", color: "#e0f2fe" }}>
                              <strong>{b.offices} Offices</strong> • Manager: {b.manager}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "30px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                Click any district on the map to inspect details
              </div>
            )}

            {/* Quick Province Breakdown Card */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                padding: "16px 20px",
                fontSize: "13px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>
                Province Directory
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {PROVINCE_NAMES.map((prov: string, i: number) => {
                  const count = getDistrictsByProvince(i + 1).length;
                  return (
                    <div
                      key={prov}
                      onClick={() => {
                        setMode("province");
                        setSelectedProvince(prov);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: selectedProvince === prov && mode === "province" ? "#1f2937" : "transparent",
                      }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#1f2937")}
                      onMouseLeave={(e) => {
                        if (!(selectedProvince === prov && mode === "province")) {
                          (e.target as HTMLElement).style.background = "transparent";
                        }
                      }}
                    >
                      <span>
                        {i + 1}. {prov} <span style={{ opacity: 0.6 }}>({PROVINCES[i + 1]?.nepali})</span>
                      </span>
                      <span style={{ fontWeight: 700, color: "#ef4444" }}>{count} districts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Code Preview Card */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
              💻 Live React Code Snippet
            </div>
            <button
              onClick={copyCode}
              style={{
                background: copiedCode ? "#16a34a" : "#374151",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              {copiedCode ? "✓ Copied!" : "Copy Code"}
            </button>
          </div>
          <pre
            style={{
              background: "#0b0f19",
              border: "1px solid #1f2937",
              borderRadius: "8px",
              padding: "16px",
              fontSize: "13px",
              fontFamily: "monospace",
              color: "#38bdf8",
              overflowX: "auto",
              lineHeight: 1.6,
            }}
          >
            {generatedCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
