import React from 'react';
import { TH, RULER_W } from '../constants/trailerTypes';

export default function SideElevation({ pallets, selected, heightOverIds, TL, HALF }) {
  const PANEL_H = 220; // px
  const placed   = pallets.filter(p => p.fitStatus === "fit");
  const overflow = pallets.filter(p => p.fitStatus === "overflow");
  const ticks = [];
  for (let h = 0; h <= TH; h += 12) ticks.push(h);
  const ftLines = Math.floor(TL / 12);

  function colColor(p) {
    if (heightOverIds.has(p.id)) return "c-red-col";
    if (p.stackable)              return "c-green-col";
    return "c-blue-col";
  }

  return (
    <div className="side-section">
      <div className="side-hint">
        Side elevation · nose left, doors right · height max 107"
        {heightOverIds.size > 0 && (
          <span style={{ color: "#ef4444", fontWeight: 600, marginLeft: "0.5rem" }}>
            ⚠ {heightOverIds.size} position{heightOverIds.size > 1 ? "s" : ""} exceed height
          </span>
        )}
      </div>

      <div className="side-row">
        {/* Height ruler */}
        <div className="side-ruler" style={{ height: PANEL_H + "px" }}>
          {ticks.map(h => (
            <React.Fragment key={h}>
              <div className="ruler-tick"      style={{ bottom: `${(h / TH) * 100}%` }}>{h}"</div>
              <div className="ruler-tick-line" style={{ bottom: `${(h / TH) * 100}%` }} />
            </React.Fragment>
          ))}
        </div>

        {/* Canvas */}
        <div className="side-canvas-wrap">
          <div className="side-canvas" style={{ height: PANEL_H + "px" }}>

            {/* 107" ceiling line */}
            <div className="ceiling-line" style={{ bottom: "100%" }}>
              <span className="ceiling-tag">107" ceiling</span>
            </div>

            {/* Half-trailer vertical line */}
            <div className="side-half-line" style={{ left: `${(HALF / TL) * 100}%` }} />

            {/* Foot-interval grid lines */}
            {Array.from({ length: ftLines - 1 }, (_, i) => i + 1).map(ft => (
              <div key={ft} style={{
                position: "absolute", top: 0, bottom: 0,
                left: `${(ft * 12 / TL) * 100}%`,
                borderLeft: "1px solid #f1f5f9",
                pointerEvents: "none", zIndex: 1,
              }} />
            ))}

            {/* Placed pallet columns */}
            {placed.map(p => {
              const wIn     = p.rotated ? p.width  : p.length;
              const isSel   = selected === p.id;
              const isOver  = heightOverIds.has(p.id);
              const leftPct = (p.x  / TL) * 100;
              const widPct  = (wIn  / TL) * 100;
              const normalH  = Math.min(p.stackHeight, TH);
              const overH    = Math.max(0, p.stackHeight - TH);
              const colHPct  = (normalH / TH) * 100;
              const overHPct = (overH   / TH) * 100;

              return (
                <React.Fragment key={p.id}>
                  {/* Stack column */}
                  <div
                    className={`side-pallet-col ${colColor(p)}${isSel ? " sel-col" : ""}`}
                    style={{
                      left:   `${leftPct}%`,
                      width:  `${widPct}%`,
                      height: `${colHPct}%`,
                      zIndex: isSel ? 15 : isOver ? 12 : 5,
                      border: `2px solid ${isOver ? "#b91c1c" : p.stackable ? "#047857" : "#1d4ed8"}`,
                      borderRadius: "3px",
                      overflow: "visible",
                    }}
                    title={`Pallet ${p.rowNum} | ${p.pieces} unit${p.pieces > 1 ? "s" : ""} × ${p.height}" = ${p.stackHeight}" total`}
                  >
                    {/* Individual unit layers + divider lines */}
                    {Array.from({ length: p.pieces }, (_, i) => {
                      const layerHPct = (p.height / normalH) * 100;
                      const bottomPct = (i * p.height / normalH) * 100;
                      return (
                        <React.Fragment key={i}>
                          <div
                            className="side-layer"
                            style={{
                              bottom:   `${bottomPct}%`,
                              height:   `${layerHPct}%`,
                              position: "absolute",
                              left: 0, right: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              overflow: "hidden",
                              zIndex: 2,
                            }}
                          >
                            <div className="side-layer-label">
                              P{p.rowNum}{p.pieces > 1 ? `·${i + 1}` : ""} {p.height}"
                            </div>
                          </div>
                          {/* Divider line between layers */}
                          {i < p.pieces - 1 && (
                            <div style={{
                              position:     "absolute",
                              left: 0, right: 0,
                              bottom:       `${bottomPct + layerHPct}%`,
                              height:       0,
                              borderTop:    "2px dashed #fff",
                              zIndex:       20,
                              pointerEvents: "none",
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Red overflow strip above ceiling */}
                  {isOver && (
                    <div
                      className="ht-over-strip"
                      style={{
                        left:      `${leftPct}%`,
                        width:     `${widPct}%`,
                        bottom:    "100%",
                        height:    `${overHPct}%`,
                        zIndex:    16,
                        minHeight: "6px",
                      }}
                    >
                      <div className="ht-over-label">+{overH}"</div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Overflow indicator */}
            {overflow.length > 0 && (
              <div style={{
                position: "absolute", right: 4, bottom: 4,
                fontSize: "0.6rem", color: "#ef4444", fontWeight: 700,
                background: "rgba(255,255,255,0.92)", borderRadius: 4,
                padding: "2px 5px", zIndex: 20,
              }}>
                +{overflow.length} overflow
              </div>
            )}
          </div>
        </div>
      </div>

      {overflow.length > 0 && (
        <div style={{
          marginTop: "0.4rem", fontSize: "0.72rem",
          color: "#94a3b8", paddingLeft: RULER_W + "px",
        }}>
          {overflow.length} position{overflow.length > 1 ? "s" : ""} could not be placed and are not shown.
        </div>
      )}
    </div>
  );
}
