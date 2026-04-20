import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorBanner, LoadingNotice } from "../components/feedback/PageStates";
import { getAccessToken } from "../lib/authToken";
import { createAsset, listAssets } from "../services/assets";
import type { AssetRead } from "../types/asset";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AssetsPage() {
  const [items, setItems] = useState<AssetRead[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [currency, setCurrency] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const token = getAccessToken();
  const needsAuth = !token;

  const load = useCallback(async () => {
    if (needsAuth) return;
    setListError("");
    setLoading(true);
    try {
      const data = await listAssets();
      setItems(data);
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Nu am putut incarca activele.");
    } finally {
      setLoading(false);
    }
  }, [needsAuth]);

  useEffect(() => {
    if (needsAuth) {
      setItems([]);
      setLoading(false);
      return;
    }
    void load();
  }, [needsAuth, load]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        (a.name?.toLowerCase().includes(q) ?? false) ||
        (a.asset_type?.toLowerCase().includes(q) ?? false) ||
        (a.currency?.toLowerCase().includes(q) ?? false),
    );
  }, [items, filter]);

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    if (!symbol.trim()) {
      setCreateError("Simbolul este obligatoriu.");
      return;
    }
    try {
      setCreating(true);
      await createAsset({
        symbol: symbol.trim(),
        name: name.trim() || null,
        asset_type: assetType.trim() || null,
        currency: currency.trim() || null,
      });
      setSymbol("");
      setName("");
      setAssetType("");
      setCurrency("");
      await load();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Crearea activului a esuat.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="portfolios-page">
      <section className="card">
        <h3>Assets</h3>
        <p className="muted">
          Catalog de active folosit la <Link to="/portfolios">portofolii</Link> si detineri. Selectia in
          pagina de detineri foloseste lista de mai jos (cu filtru).
        </p>

        {needsAuth && (
          <ErrorBanner
            title="Autentificare necesara"
            message="Catalogul de active este disponibil dupa login."
          />
        )}

        {listError && <ErrorBanner title="Lista active" message={listError} />}

        <form className="portfolio-form" onSubmit={onCreate}>
          <h4 className="subsection-title">Adauga activ</h4>
          <label htmlFor="asset-symbol">Simbol</label>
          <input
            id="asset-symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="ex: AAPL, BTC"
          />
          {createError && <p className="field-error">{createError}</p>}

          <label htmlFor="asset-name">Nume (optional)</label>
          <input
            id="asset-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={needsAuth || creating}
          />

          <label htmlFor="asset-type">Tip (optional)</label>
          <input
            id="asset-type"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="stock / crypto"
          />

          <label htmlFor="asset-currency">Moneda (optional)</label>
          <input
            id="asset-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="USD"
          />

          <button type="submit" disabled={needsAuth || creating} className="btn-primary">
            {creating ? "Se creeaza..." : "Adauga activ"}
          </button>
        </form>
      </section>

      <section className="card">
        <h4 className="subsection-title">Lista active</h4>
        <label htmlFor="assets-filter" className="sr-only">
          Filtreaza
        </label>
        <input
          id="assets-filter"
          type="search"
          className="filter-input"
          placeholder="Filtreaza dupa simbol, nume, tip..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={needsAuth}
        />

        {loading ? (
          <LoadingNotice label="Incarcare active din API..." />
        ) : needsAuth ? (
          <EmptyState
            title="Catalog indisponibil"
            description="Autentifica-te pentru a incarca si gestiona activele."
          >
            <Link className="btn-link" to="/login">
              Login
            </Link>
          </EmptyState>
        ) : filtered.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              title="Niciun activ in catalog"
              description="Adauga un simbol (ex. AAPL) folosind formularul de mai sus. Activele sunt partajate pentru toate portofoliile."
            />
          ) : (
            <EmptyState
              title="Niciun rezultat"
              description="Incearca alt termen de cautare sau sterge filtrul."
            />
          )
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Simbol</th>
                  <th>Nume</th>
                  <th>Tip</th>
                  <th>Moneda</th>
                  <th>Actualizat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{a.symbol}</td>
                    <td className="cell-muted">{a.name || "—"}</td>
                    <td className="cell-muted">{a.asset_type || "—"}</td>
                    <td className="cell-muted">{a.currency || "—"}</td>
                    <td className="cell-muted">{formatDate(a.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
