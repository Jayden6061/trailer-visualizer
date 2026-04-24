import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus, Truck, Package, Layers3,
  Weight, AlertTriangle, RotateCw, LayoutGrid,
} from "lucide-react";

import logo from "../../public/logo_transparent.png";
import FreightRow from "./FreightRow";
import SideElevation from "./SideElevation";
import "../styles/TrailerVisualizer.css";

import { TRAILER_TYPES, TW, TH, MAX_W, SNAP_PX } from "../constants/trailerTypes";
import { clamp, fmtPct, rectsOverlap, snapAway, buildPallets, initialRows } from "../utils/palletUtils";

export default function TrailerVisualizer() {
  const [trailerKey, setTrailerKey] = useState("28");
  const trailer = TRAILER_TYPES[trailerKey];
  const TL   = trailer.lengthIn;
  const HALF = trailer.halfIn;

  const [rows,     setRows]     = useState(initialRows);
  const [pallets,  setPallets]  = useState(() => buildPallets(initialRows, TRAILER_TYPES["28"].lengthIn));
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const trailerRef = useRef(null);

  const changeTrailer = (key) => {
    setTrailerKey(key);
    setSelected(null);
    setPallets(buildPallets(rows, TRAILER_TYPES[key].lengthIn));
  };

  const syncPallets = useCallback((newRows, tl = TL) => {
    const fresh = buildPallets(newRows, tl);
    setPallets(prev => {
      const existing = Object.fromEntries(prev.map(p => [p.id, p]));
      return fresh.map(fp =>
        existing[fp.id]
          ? { ...fp, x: existing[fp.id].x, y: existing[fp.id].y, rotated: existing[fp.id].rotated }
          : fp
      );
    });
  }, [TL]);

  const addRow = () => {
    const newRows = [...rows, { id: Date.now(), qty: 1, length: 48, width: 48, height: 48, weight: "", stackable: false }];
    setRows(newRows); syncPallets(newRows);
  };
  const updateRow = (id, field, value) => {
    const newRows = rows.map(r => r.id === id ? { ...r, [field]: value } : r);
    setRows(newRows); syncPallets(newRows);
  };
  const removeRow = (id) => {
    const newRows = rows.filter(r => r.id !== id);
    setRows(newRows); syncPallets(newRows);
  };
  const resetLayout = () => { setPallets(buildPallets(rows, TL)); setSelected(null); };

  const rotatePallet = (id) => {
    setPallets(prev => prev.map(p => {
      if (p.id !== id) return p;
      const nr = !p.rotated;
      const nW = nr ? p.width : p.length;
      const nH = nr ? p.length : p.width;
      return { ...p, rotated: nr, x: Math.max(0, Math.min(p.x, TL - nW)), y: Math.max(0, Math.min(p.y, TW - nH)) };
    }));
  };

  /* ── Drag ── */
  const onMouseDown = useCallback((e, id) => {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    setSelected(id);
    const p = pallets.find(p => p.id === id);
    if (p) setDragging({ id, startMX: e.clientX, startMY: e.clientY, startPX: p.x, startPY: p.y });
  }, [pallets]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const rect = trailerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const p = pallets.find(p => p.id === dragging.id);
    if (!p) return;
    const sX = TL / rect.width, sY = TW / rect.height;
    const wIn = p.rotated ? p.width : p.length;
    const hIn = p.rotated ? p.length : p.width;
    let nx = Math.max(0, Math.min(TL - wIn, dragging.startPX + (e.clientX - dragging.startMX) * sX));
    let ny = Math.max(0, Math.min(TW - hIn, dragging.startPY + (e.clientY - dragging.startMY) * sY));
    const thX = SNAP_PX * sX, thY = SNAP_PX * sY;
    if (nx < thX) nx = 0;
    if (ny < thY) ny = 0;
    if (TL - wIn - nx < thX) nx = TL - wIn;
    if (TW - hIn - ny < thY) ny = TW - hIn;
    for (const o of pallets.filter(o => o.id !== dragging.id)) {
      const oW = o.rotated ? o.width : o.length;
      const oH = o.rotated ? o.length : o.width;
      if (Math.abs(nx - (o.x + oW)) < thX) nx = o.x + oW;
      if (Math.abs(nx + wIn - o.x)  < thX) nx = o.x - wIn;
      if (Math.abs(ny - (o.y + oH)) < thY) ny = o.y + oH;
      if (Math.abs(ny + hIn - o.y)  < thY) ny = o.y - hIn;
    }
    setPallets(prev => prev.map(pp => pp.id === dragging.id ? { ...pp, x: nx, y: ny } : pp));
  }, [dragging, pallets, TL]);

  const onMouseUp = useCallback(() => {
    if (!dragging) return;
    const p = pallets.find(pp => pp.id === dragging.id);
    if (p) {
      const wIn = p.rotated ? p.width : p.length;
      const hIn = p.rotated ? p.length : p.width;
      const others = pallets
        .filter(o => o.id !== dragging.id)
        .map(o => ({ x: o.x, y: o.y, w: o.rotated ? o.width : o.length, h: o.rotated ? o.length : o.width }));
      if (others.some(o => rectsOverlap({ x: p.x, y: p.y, w: wIn, h: hIn }, o))) {
        const sn = snapAway({ x: p.x, y: p.y, w: wIn, h: hIn }, others, TL, TW);
        setPallets(prev => prev.map(pp => pp.id === dragging.id ? { ...pp, x: sn.x, y: sn.y } : pp));
      }
    }
    setDragging(null);
  }, [dragging, pallets, TL]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const placed = pallets.filter(p => p.fitStatus === "fit");
    const usedX  = placed.reduce((m, p) => Math.max(m, p.x + (p.rotated ? p.width : p.length)), 0);
    const usedLinearFeet = usedX / 12;
    const usedPct  = (usedX / TL) * 100;
    const overflow = pallets.filter(p => p.fitStatus === "overflow").length;
    const floorPct = (
      placed.reduce((s, p) => s + (p.rotated ? p.width : p.length) * (p.rotated ? p.length : p.width), 0)
      / (TL * TW)
    ) * 100;
    const totalWeight = rows.reduce(
      (s, r) => s + Math.max(0, Math.floor(clamp(r.qty, 0))) * clamp(r.weight, 0), 0
    );
    const exceedsHalf   = usedX > HALF;
    const exceedsWeight = totalWeight > MAX_W;

    const collisionIds = new Set();
    for (let i = 0; i < pallets.length; i++) {
      for (let j = i + 1; j < pallets.length; j++) {
        const a = pallets[i], b = pallets[j];
        const ra = { x: a.x, y: a.y, w: a.rotated ? a.width : a.length, h: a.rotated ? a.length : a.width };
        const rb = { x: b.x, y: b.y, w: b.rotated ? b.width : b.length, h: b.rotated ? b.length : b.width };
        if (rectsOverlap(ra, rb)) { collisionIds.add(a.id); collisionIds.add(b.id); }
      }
    }

    const heightOverIds = new Set();
    for (const p of pallets) {
      if (p.stackHeight > TH || p.height > TH) heightOverIds.add(p.id);
    }

    const exceedsHeight = heightOverIds.size > 0;
    const warn = exceedsHalf || exceedsWeight || exceedsHeight;

    return {
      usedLinearFeet, usedPct, overflow, floorPct,
      totalWeight, exceedsHalf, exceedsWeight, exceedsHeight,
      warn, collisionIds, heightOverIds,
    };
  }, [pallets, rows, TL, HALF]);

  const selPallet = pallets.find(p => p.id === selected);

  function topColor(p) {
    if (stats.heightOverIds.has(p.id)) return "c-red";
    if (p.fitStatus === "overflow")     return "c-red";
    if (p.stackable)                    return "c-green";
    return "c-blue";
  }

  return (
    <>
      {/* ── Branded banner ── */}
      <div className="brand-banner">
        <img src={logo} alt="Diamond Line Delivery" />
      </div>

      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* ── Header ── */}
          <div className="header">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trailer Visualizer</h1>
              <p className="text-sm text-slate-600 mt-1">
                Enter pallet dimensions, mark stackable freight, and view estimated trailer usage visually.
              </p>
            </div>
            <div className="header-right">
              <div className="trailer-badge">
                <Truck className="h-4 w-4" />
                <strong>{trailer.label}</strong>&nbsp;·&nbsp;94" wide&nbsp;·&nbsp;107" tall
              </div>
              <div className="trailer-select-wrap">
                <label htmlFor="trailer-select">Trailer size:</label>
                <select
                  id="trailer-select"
                  className="trailer-select"
                  value={trailerKey}
                  onChange={e => changeTrailer(e.target.value)}
                >
                  {Object.entries(TRAILER_TYPES).map(([k, t]) => (
                    <option key={k} value={k}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">

            {/* Freight entry */}
            <Card className="rounded-3xl shadow-sm border-0">
              <CardHeader><CardTitle className="text-xl">Freight Entry</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="col-headers">
                  <div>Qty</div><div>Length (in)</div><div>Width (in)</div>
                  <div>Height (in)</div><div>Weight (lbs)</div><div>Stackable</div><div />
                </div>
                {rows.map(row => (
                  <FreightRow key={row.id} row={row}
                    onUpdate={updateRow} onRemove={removeRow}
                    canRemove={rows.length > 1} />
                ))}
                <Button onClick={addRow} className="rounded-2xl">
                  <Plus className="mr-2 h-4 w-4" /> Add Line
                </Button>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="font-medium mb-1">Stacking, height &amp; interaction</div>
                  <p>
                    Only pallets with <strong>Stackable</strong> enabled will be stacked; non-stackable
                    pallets each get their own floor position. Stacks are limited by trailer height (107").
                    Red indicates a height violation or overflow. Drag pallets freely in the top-down view.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats + Legend */}
            <div className="space-y-6">
              <Card className="rounded-3xl shadow-sm border-0">
                <CardContent className="p-5">
                  <div className="stats-grid">

                    <div className="stat-card">
                      <div className="stat-label"><Layers3 className="h-4 w-4" /> Linear usage</div>
                      <div className="stat-value">{stats.usedLinearFeet.toFixed(1)} ft</div>
                      <div className="stat-sub">{fmtPct(stats.usedPct)} of {trailer.lengthFt}' trailer</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label"><Package className="h-4 w-4" /> Floor coverage</div>
                      <div className="stat-value">{fmtPct(stats.floorPct)}</div>
                      <div className="stat-sub">Estimated floor space filled</div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-label"><Truck className="h-4 w-4" /> Overflow</div>
                      <div className="stat-value">{stats.overflow}</div>
                      <div className="stat-sub">Placements beyond trailer capacity</div>
                    </div>

                    <div className={`stat-card${stats.exceedsHeight ? " warn" : ""}`}>
                      <div className={`stat-label${stats.exceedsHeight ? " warn" : ""}`}>↕ Height violations</div>
                      <div className={`stat-value${stats.exceedsHeight ? " warn" : ""}`}>{stats.heightOverIds.size}</div>
                      <div className={`stat-sub${stats.exceedsHeight ? " warn" : ""}`}>
                        {stats.exceedsHeight ? "Position(s) exceed 107\" max" : "All within 107\" clearance"}
                      </div>
                    </div>

                    <div className={`stat-card${stats.exceedsWeight ? " warn" : ""}`}>
                      <div className={`stat-label${stats.exceedsWeight ? " warn" : ""}`}><Weight className="h-4 w-4" /> Total weight</div>
                      <div className={`stat-value${stats.exceedsWeight ? " warn" : ""}`}>
                        {stats.totalWeight > 0 ? `${stats.totalWeight.toLocaleString()} lbs` : "—"}
                      </div>
                      <div className={`stat-sub${stats.exceedsWeight ? " warn" : ""}`}>
                        {stats.exceedsWeight
                          ? `Exceeds ${MAX_W.toLocaleString()} lb threshold`
                          : `Limit: ${MAX_W.toLocaleString()} lbs`}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-sm border-0">
                <CardHeader><CardTitle className="text-xl">Legend</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded bg-blue-500" /> Non-stackable</div>
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded bg-emerald-500" /> Stackable</div>
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded bg-red-500" /> Overflow or height violation</div>
                  <div className="flex items-center gap-3"><div className="h-1 w-4 bg-amber-400" /> Half-trailer &amp; ceiling lines</div>
                  <div className="flex items-center gap-3"><div className="h-4 w-4 rounded-full bg-violet-600" /> Stack count badge (×N)</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Trailer Views card ── */}
          <Card className="rounded-3xl shadow-sm border-0">
            <CardHeader><CardTitle className="text-xl">Trailer Views</CardTitle></CardHeader>
            <CardContent>

              {/* Toolbar */}
              <div className="toolbar">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={resetLayout}>
                  <LayoutGrid className="h-4 w-4 mr-1" /> Reset Layout
                </Button>
                {selected && (<>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => rotatePallet(selected)}>
                    <RotateCw className="h-4 w-4 mr-1" /> Rotate
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setSelected(null)}>
                    ✕ Deselect
                  </Button>
                </>)}
                {selPallet && (
                  <span className="sel-info">
                    <strong>Pallet {selPallet.rowNum}</strong>&nbsp;·&nbsp;
                    {selPallet.rotated ? `${selPallet.width}×${selPallet.length}` : `${selPallet.length}×${selPallet.width}`}"
                    floor&nbsp;·&nbsp;
                    {selPallet.pieces > 1
                      ? `×${selPallet.pieces} high (${selPallet.stackHeight}")`
                      : `${selPallet.height}" tall`}
                    {stats.heightOverIds.has(selPallet.id) && (
                      <span style={{ color: "#ef4444", marginLeft: "0.4rem", fontWeight: 700 }}>⚠ exceeds height</span>
                    )}
                  </span>
                )}
              </div>

              {/* Warning banner */}
              {stats.warn && (
                <div className="vol-warn">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <strong>Warning:</strong> due to size this shipment may require a volume quote.
                    {stats.exceedsHalf   && <span className="sub">Shipment exceeds half-trailer ({trailer.halfFt}').</span>}
                    {stats.exceedsWeight && <span className="sub">Total weight exceeds {MAX_W.toLocaleString()} lbs.</span>}
                    {stats.exceedsHeight && (
                      <span className="sub">
                        {stats.heightOverIds.size} pallet position{stats.heightOverIds.size > 1 ? "s" : ""} exceed the 107" trailer height.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Shared views container */}
              <div className="views-container">

                {/* Top-down view */}
                <div className="topdown-section">
                  <div className="view-hint">
                    <span><strong>Top-down</strong> · nose left, doors right · drag to reposition</span>
                    <span>Width = 94"</span>
                  </div>
                  <div className="topdown-row">
                    <div className="topdown-ruler-spacer" />
                    <div
                      ref={trailerRef}
                      className={`topdown-trailer-wrap ${stats.warn ? "warning" : "normal"}`}
                      style={{ aspectRatio: `${TL}/${TW}`, minHeight: "120px" }}
                      onClick={() => setSelected(null)}
                    >
                      {stats.warn && <div className="trailer-tint" />}
                      <span className="t-label nose">Nose</span>
                      <span className="t-label doors">Doors</span>
                      <div className="half-line" style={{ left: `${(HALF / TL) * 100}%` }}>
                        <span className="half-tag">½ · {trailer.halfFt}'</span>
                      </div>

                      {pallets.map(p => {
                        const wIn = p.rotated ? p.width  : p.length;
                        const hIn = p.rotated ? p.length : p.width;
                        const isDrag = dragging?.id === p.id;
                        const isSel  = selected === p.id;
                        const hasClash = stats.collisionIds.has(p.id);
                        const unitWeight = p.weight > 0 ? p.weight * p.pieces : null;
                        let cls = `pallet ${topColor(p)}`;
                        if (isDrag)              cls += " dragging";
                        if (isSel)               cls += " sel";
                        if (hasClash && !isDrag) cls += " clash";
                        return (
                          <div key={p.id} className={cls}
                            style={{
                              left:   `${(p.x  / TL) * 100}%`,
                              top:    `${(p.y  / TW) * 100}%`,
                              width:  `${(wIn  / TL) * 100}%`,
                              height: `${(hIn  / TW) * 100}%`,
                            }}
                            onMouseDown={e => { e.stopPropagation(); onMouseDown(e, p.id); }}
                            onClick={e => { e.stopPropagation(); setSelected(p.id); }}
                            title={`Pallet ${p.rowNum} | ${p.length}×${p.width}×${p.height}"${unitWeight ? ` | ${unitWeight.toLocaleString()} lbs` : ""} | ×${p.pieces} high (${p.stackHeight}")`}
                          >
                            {p.pieces > 1 && <div className="stack-badge">×{p.pieces}</div>}
                            <div className="p-name">P{p.rowNum}</div>
                            <div className="p-dims">{p.rotated ? `${p.width}×${p.length}` : `${p.length}×${p.width}`}"</div>
                            {unitWeight !== null && <div className="p-wt">{unitWeight.toLocaleString()} lbs</div>}
                            <div className="p-stack">
                              {p.fitStatus === "overflow"           ? "OVF"
                                : stats.heightOverIds.has(p.id)    ? `⚠${p.stackHeight}"`
                                : p.pieces > 1                     ? `×${p.pieces}·${p.stackHeight}"`
                                : `${p.height}"`}
                            </div>
                            {isSel && (
                              <div
                                className="rot-handle"
                                onMouseDown={e => e.stopPropagation()}
                                onClick={e => { e.stopPropagation(); rotatePallet(p.id); }}
                              >
                                <RotateCw className="h-2.5 w-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Side elevation */}
                <SideElevation
                  pallets={pallets}
                  selected={selected}
                  heightOverIds={stats.heightOverIds}
                  TL={TL}
                  HALF={HALF}
                />

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
