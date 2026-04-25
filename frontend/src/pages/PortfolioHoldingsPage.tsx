import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { EmptyState, ErrorBanner, LoadingNotice } from "../components/feedback/PageStates";
import { getAccessToken } from "../lib/authToken";
import { listAssets } from "../services/assets";
import {
  createHolding,
  deleteHolding,
  listHoldings,
  updateHolding,
} from "../services/holdings";
import { getPortfolioValuation, refreshPortfolioPrices } from "../services/portfolios";
import type { AssetRead } from "../types/asset";
import type { HoldingRead } from "../types/holding";
import type { PortfolioRefreshResponse, PortfolioValuationRead } from "../types/portfolio";

function formatDec(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function PortfolioHoldingsPage() {
  const { portfolioId: portfolioIdParam } = useParams<{ portfolioId: string }>();
  const portfolioId = Number(portfolioIdParam);
  const idValid = Number.isInteger(portfolioId) && portfolioId > 0;

  const [holdings, setHoldings] = useState<HoldingRead[]>([]);
  const [assets, setAssets] = useState<AssetRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [assetsError, setAssetsError] = useState("");

  const [assetFilter, setAssetFilter] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newAvgCost, setNewAvgCost] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editAvgCost, setEditAvgCost] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionError, setActionError] = useState("");

  const [valuation, setValuation] = useState<PortfolioValuationRead | null>(null);
  const [valuationError, setValuationError] = useState("");
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [refreshSuccess, setRefreshSuccess] = useState("");
  const [lastRefresh, setLastRefresh] = useState<PortfolioRefreshResponse | null>(null);

  const token = getAccessToken();
  const needsAuth = !token;

  const assetById = useMemo(() => {
    const m = new Map<number, AssetRead>();
    for (const a of assets) m.set(a.id, a);
    return m;
  }, [assets]);

  const filteredAssets = useMemo(() => {
    const q = assetFilter.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        (a.name?.toLowerCase().includes(q) ?? false) ||
        (a.asset_type?.toLowerCase().includes(q) ?? false),
    );
  }, [assets, assetFilter]);

  const loadHoldings = useCallback(async () => {
    if (!idValid || needsAuth) return;
    setListError("");
    setValuationError("");
    setLoading(true);
    try {
      const data = await listHoldings(portfolioId);
      setHoldings(data);
      try {
        const v = await getPortfolioValuation(portfolioId);
        setValuation(v);
      } catch (ve) {
        setValuation(null);
        setValuationError(
          ve instanceof Error ? ve.message : "Nu am putut incarca evaluarea portofoliului.",
        );
      }
    } catch (error) {
      setHoldings([]);
      setValuation(null);
      setListError(error instanceof Error ? error.message : "Nu am putut incarca detinerile.");
    } finally {
      setLoading(false);
    }
  }, [idValid, needsAuth, portfolioId]);

  const loadAssets = useCallback(async () => {
    if (needsAuth) return;
    setAssetsError("");
    try {
      const data = await listAssets();
      setAssets(data);
    } catch (error) {
      setAssetsError(error instanceof Error ? error.message : "Nu am putut incarca activele.");
    }
  }, [needsAuth]);

  useEffect(() => {
    if (!idValid || needsAuth) {
      setHoldings([]);
      setLoading(false);
      return;
    }
    void loadHoldings();
  }, [idValid, needsAuth, loadHoldings]);

  useEffect(() => {
    if (needsAuth) {
      setAssets([]);
      return;
    }
    void loadAssets();
  }, [needsAuth, loadAssets]);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    setActionError("");
    const assetId = Number(selectedAssetId);
    if (!Number.isInteger(assetId) || assetId <= 0) {
      setCreateError("Selecteaza un activ.");
      return;
    }
    if (!newQty.trim() || Number(newQty) < 0) {
      setCreateError("Cantitatea trebuie sa fie >= 0.");
      return;
    }
    try {
      setCreating(true);
      await createHolding(portfolioId, {
        portfolio_id: portfolioId,
        asset_id: assetId,
        quantity: newQty.trim(),
        avg_cost: newAvgCost.trim() ? newAvgCost.trim() : null,
      });
      setNewQty("");
      setNewAvgCost("");
      setSelectedAssetId("");
      await loadHoldings();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Crearea detinerii a esuat.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (h: HoldingRead) => {
    setEditingId(h.id);
    setEditQty(String(h.quantity));
    setEditAvgCost(h.avg_cost !== null && h.avg_cost !== undefined ? String(h.avg_cost) : "");
    setEditError("");
    setActionError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQty("");
    setEditAvgCost("");
    setEditError("");
  };

  const onSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId === null) return;
    setEditError("");
    setActionError("");
    if (!editQty.trim() || Number(editQty) < 0) {
      setEditError("Cantitatea trebuie sa fie >= 0.");
      return;
    }
    try {
      setSavingEdit(true);
      await updateHolding(portfolioId, editingId, {
        quantity: editQty.trim(),
        avg_cost: editAvgCost.trim() ? editAvgCost.trim() : null,
      });
      cancelEdit();
      await loadHoldings();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Actualizarea a esuat.");
    } finally {
      setSavingEdit(false);
    }
  };

  const onDelete = async (h: HoldingRead) => {
    setActionError("");
    const sym = assetById.get(h.asset_id)?.symbol ?? `#${h.asset_id}`;
    const ok = window.confirm(`Stergi detinerea pentru ${sym}?`);
    if (!ok) return;
    try {
      await deleteHolding(portfolioId, h.id);
      if (editingId === h.id) cancelEdit();
      await loadHoldings();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Stergerea a esuat.");
    }
  };

  const onRefreshPrices = async () => {
    if (needsAuth || refreshingPrices || !idValid) return;
    setRefreshError("");
    setRefreshSuccess("");
    setValuationError("");
    try {
      setRefreshingPrices(true);
      const refreshResult = await refreshPortfolioPrices(portfolioId);
      setLastRefresh(refreshResult);
      const okCount = refreshResult.results.filter((r) => r.status === "success").length;
      const failCount = refreshResult.results.length - okCount;
      setRefreshSuccess(
        failCount === 0
          ? `Preturile au fost actualizate pentru ${okCount} active.`
          : `Refresh finalizat: ${okCount} active actualizate, ${failCount} cu probleme.`,
      );

      const nextValuation = await getPortfolioValuation(portfolioId);
      setValuation(nextValuation);
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : "Nu am putut face refresh la preturi.");
      try {
        const fallbackValuation = await getPortfolioValuation(portfolioId);
        setValuation(fallbackValuation);
      } catch (valuationLoadError) {
        setValuation(null);
        setValuationError(
          valuationLoadError instanceof Error
            ? valuationLoadError.message
            : "Nu am putut reincarca evaluarea dupa refresh.",
        );
      }
    } finally {
      setRefreshingPrices(false);
    }
  };

  if (!idValid) {
    return (
      <section className="card">
        <ErrorBanner title="Ruta invalida" message="ID-ul portofoliului din URL nu este valid." />
        <Link className="btn-link" to="/portfolios">
          Inapoi la portofolii
        </Link>
      </section>
    );
  }

  return (
    <div className="portfolios-page">
      <section className="card">
        <p className="muted back-row">
          <Link to="/portfolios">← Portofolii</Link>
          {" · "}
          <strong>Detineri portofoliu #{portfolioId}</strong>
        </p>
        <h3>Detineri (holdings)</h3>
        <p className="muted">
          Adauga pozitii pe active existente. Poti crea active noi din pagina{" "}
          <Link to="/assets">Assets</Link>.
        </p>

        {needsAuth && (
          <ErrorBanner
            title="Autentificare necesara"
            message="Detinerile se incarca si salveaza doar dupa login."
          />
        )}

        {listError && <ErrorBanner title="Detineri" message={listError} />}
        {assetsError && <ErrorBanner title="Catalog active" message={assetsError} />}
        {actionError && <ErrorBanner title="Actiune esuata" message={actionError} />}

        <form className="portfolio-form" onSubmit={onCreate}>
          <h4 className="subsection-title">Adauga detinere</h4>

          <label htmlFor="asset-filter">Cauta activ (simbol / nume / tip)</label>
          <input
            id="asset-filter"
            type="search"
            value={assetFilter}
            onChange={(e) => setAssetFilter(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="ex: AAPL sau crypto"
            autoComplete="off"
          />

          <label htmlFor="holding-asset">Selecteaza activ</label>
          <select
            id="holding-asset"
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            disabled={needsAuth || creating || filteredAssets.length === 0}
            className="select-block"
          >
            <option value="" disabled>
              {filteredAssets.length === 0 ? "— Nu exista active (adauga din Assets)" : "— Alege un activ —"}
            </option>
            {filteredAssets.map((a) => (
              <option key={a.id} value={String(a.id)}>
                {a.symbol}
                {a.name ? ` — ${a.name}` : ""}
                {a.asset_type ? ` (${a.asset_type})` : ""}
              </option>
            ))}
          </select>
          {selectedAssetId ? (
            <p className="muted">Activ selectat: {assetById.get(Number(selectedAssetId))?.symbol ?? selectedAssetId}</p>
          ) : null}

          <label htmlFor="holding-qty">Cantitate</label>
          <input
            id="holding-qty"
            type="text"
            inputMode="decimal"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="0"
          />

          <label htmlFor="holding-avg">Cost mediu (optional)</label>
          <input
            id="holding-avg"
            type="text"
            inputMode="decimal"
            value={newAvgCost}
            onChange={(e) => setNewAvgCost(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="0.00"
          />

          {createError && <p className="field-error">{createError}</p>}

          <button type="submit" disabled={needsAuth || creating} className="btn-primary">
            {creating ? "Se adauga..." : "Adauga detinere"}
          </button>
        </form>
      </section>

      {editingId !== null && (
        <section className="card portfolio-edit-card">
          <h4 className="subsection-title">Editeaza detinere</h4>
          <form className="portfolio-form" onSubmit={onSaveEdit}>
            <label htmlFor="edit-qty">Cantitate</label>
            <input
              id="edit-qty"
              type="text"
              inputMode="decimal"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              disabled={needsAuth || savingEdit}
            />
            {editError && <p className="field-error">{editError}</p>}

            <label htmlFor="edit-avg">Cost mediu</label>
            <input
              id="edit-avg"
              type="text"
              inputMode="decimal"
              value={editAvgCost}
              onChange={(e) => setEditAvgCost(e.target.value)}
              disabled={needsAuth || savingEdit}
            />

            <div className="form-actions">
              <button type="submit" disabled={needsAuth || savingEdit} className="btn-primary">
                {savingEdit ? "Se salveaza..." : "Salveaza"}
              </button>
              <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={savingEdit}>
                Anuleaza
              </button>
            </div>
          </form>
        </section>
      )}

      {!needsAuth && (
        <section className="card">
          <h4 className="subsection-title">Evaluare portofoliu</h4>
          <p className="muted">
            Raspuns din API: <code>GET /portfolios/:portfolioId/valuation</code> — ultimul pret cunoscut per
            activ. Daca lipseste snapshot de pret in backend, coloana de status indica acest lucru.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void onRefreshPrices()}
              disabled={refreshingPrices || loading}
            >
              {refreshingPrices ? "Refresh in curs..." : "Refresh Prices"}
            </button>
          </div>
          {refreshingPrices && <LoadingNotice label="Se cer preturi live si se recalculeaza evaluarea..." />}
          {refreshError && <ErrorBanner title="Refresh prices esuat" message={refreshError} />}
          {refreshSuccess && <p className="field-success">{refreshSuccess}</p>}
          {lastRefresh && lastRefresh.results.some((row) => row.status !== "success") ? (
            <ErrorBanner
              title="Unele preturi nu au putut fi actualizate"
              message={lastRefresh.results
                .filter((row) => row.status !== "success")
                .map((row) => `${row.symbol ?? `id:${row.asset_id}`}: ${row.status}`)
                .join(" | ")}
            />
          ) : null}
          {valuationError && <ErrorBanner title="Evaluare portofoliu" message={valuationError} />}
          {loading && !valuation && !valuationError ? (
            <LoadingNotice label="Incarcare evaluare din API..." />
          ) : valuation ? (
            <>
              <p className="valuation-total">
                <strong>Valoare totala estimata:</strong> {formatDec(valuation.total_value)}
              </p>
              {valuation.assets.length === 0 ? (
                <EmptyState
                  title="Nimic de evaluat"
                  description="Adauga cel putin o detinere pentru a vedea linii in evaluare."
                />
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Simbol</th>
                          <th>Activ</th>
                          <th>Cantitate</th>
                          <th>Pret</th>
                          <th>Valoare</th>
                          <th>Status pret</th>
                        </tr>
                      </thead>
                      <tbody>
                        {valuation.assets.map((row, idx) => (
                          <tr key={`${row.asset_id}-${idx}`}>
                            <td>{row.symbol ?? `id:${row.asset_id}`}</td>
                            <td className="cell-muted">{row.name ?? "—"}</td>
                            <td>{formatDec(row.quantity)}</td>
                            <td className="cell-muted">{formatDec(row.price)}</td>
                            <td>{formatDec(row.value)}</td>
                            <td className="cell-muted">
                              {row.missing_price ? "Lipseste pret" : "OK"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {lastRefresh ? (
                    (() => {
                      const missingAfterRefresh = valuation.assets.filter((row) => row.missing_price);
                      if (missingAfterRefresh.length === 0) {
                        return <p className="field-success">Dupa refresh, toate detinerile au pret disponibil.</p>;
                      }
                      return (
                        <div className="error-banner" role="status" aria-live="polite">
                          <strong className="error-banner-title">
                            Dupa refresh, inca lipsesc preturi pentru {missingAfterRefresh.length} detineri
                          </strong>
                          <p className="error-banner-body">
                            {missingAfterRefresh
                              .map((row) => row.symbol ?? row.name ?? `id:${row.asset_id}`)
                              .join(", ")}
                          </p>
                        </div>
                      );
                    })()
                  ) : null}
                </>
              )}
            </>
          ) : null}
        </section>
      )}

      <section className="card">
        <h4 className="subsection-title">Lista detineri</h4>
        {loading ? (
          <LoadingNotice label="Incarcare detineri din API..." />
        ) : needsAuth ? (
          <EmptyState
            title="Lista indisponibila"
            description="Autentifica-te pentru a vedea detinerile acestui portofoliu."
          >
            <Link className="btn-link" to="/login">
              Login
            </Link>
          </EmptyState>
        ) : holdings.length === 0 ? (
          <EmptyState
            title="Nicio detinere"
            description="Selecteaza un activ din catalog (pagina Assets), apoi adauga cantitatea mai sus."
          >
            <Link className="btn-link" to="/assets">
              Deschide Assets
            </Link>
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Simbol</th>
                  <th>Activ</th>
                  <th>Cantitate</th>
                  <th>Cost mediu</th>
                  <th>Actualizat</th>
                  <th aria-label="Actiuni" />
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => {
                  const a = assetById.get(h.asset_id);
                  return (
                    <tr key={h.id}>
                      <td>{a?.symbol ?? `id:${h.asset_id}`}</td>
                      <td className="cell-muted">{a?.name ?? "—"}</td>
                      <td>{formatDec(h.quantity)}</td>
                      <td className="cell-muted">{formatDec(h.avg_cost)}</td>
                      <td className="cell-muted">{formatDate(h.updated_at)}</td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => startEdit(h)}
                          disabled={needsAuth || editingId === h.id}
                        >
                          Editeaza
                        </button>
                        <button
                          type="button"
                          className="btn-link danger"
                          onClick={() => void onDelete(h)}
                          disabled={needsAuth}
                        >
                          Sterge
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
