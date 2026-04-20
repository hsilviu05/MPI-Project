import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { getAccessToken } from "../lib/authToken";
import {
  createPortfolio,
  deletePortfolio,
  listPortfolios,
  updatePortfolio,
} from "../services/portfolios";
import type { PortfolioRead } from "../types/portfolio";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function PortfoliosPage() {
  const [items, setItems] = useState<PortfolioRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setListError("");
    setLoading(true);
    try {
      const data = await listPortfolios();
      setItems(data);
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Nu am putut incarca portofoliile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      setItems([]);
      setListError("");
      setLoading(false);
      return;
    }
    void load();
  }, [load]);

  const token = getAccessToken();
  const needsAuth = !token;

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");
    setActionError("");
    if (!createName.trim()) {
      setCreateError("Numele portofoliului este obligatoriu.");
      return;
    }
    try {
      setCreating(true);
      await createPortfolio({
        name: createName.trim(),
        description: createDescription.trim() || null,
      });
      setCreateName("");
      setCreateDescription("");
      await load();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Crearea a esuat.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (p: PortfolioRead) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDescription(p.description ?? "");
    setEditError("");
    setActionError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditError("");
  };

  const onSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId === null) return;
    setEditError("");
    setActionError("");
    if (!editName.trim()) {
      setEditError("Numele portofoliului este obligatoriu.");
      return;
    }
    try {
      setSavingEdit(true);
      await updatePortfolio(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      cancelEdit();
      await load();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Actualizarea a esuat.");
    } finally {
      setSavingEdit(false);
    }
  };

  const onDelete = async (p: PortfolioRead) => {
    setActionError("");
    const ok = window.confirm(
      `Stergi portofoliul „${p.name}”? Actiunea nu poate fi anulata din UI.`,
    );
    if (!ok) return;
    try {
      await deletePortfolio(p.id);
      if (editingId === p.id) cancelEdit();
      await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Stergerea a esuat.");
    }
  };

  return (
    <div className="portfolios-page">
      <section className="card">
        <h3>Portofolii</h3>
        <p className="muted">
          Creeaza, editeaza si sterge portofolii. Necesita autentificare (login).
        </p>

        {needsAuth && (
          <p className="field-error">
            Nu esti autentificat.{" "}
            <Link to="/login">Mergi la login</Link> pentru a gestiona portofoliile.
          </p>
        )}

        {listError && <p className="field-error">{listError}</p>}
        {actionError && <p className="field-error">{actionError}</p>}

        <form className="portfolio-form" onSubmit={onCreate}>
          <h4 className="subsection-title">Creeaza portofoliu</h4>
          <label htmlFor="portfolio-new-name">Nume</label>
          <input
            id="portfolio-new-name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="ex: Long term"
          />
          {createError && <p className="field-error">{createError}</p>}

          <label htmlFor="portfolio-new-desc">Descriere (optional)</label>
          <textarea
            id="portfolio-new-desc"
            rows={2}
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            disabled={needsAuth || creating}
            placeholder="Notite scurte"
          />

          <button type="submit" disabled={needsAuth || creating} className="btn-primary">
            {creating ? "Se creeaza..." : "Adauga portofoliu"}
          </button>
        </form>
      </section>

      {editingId !== null && (
        <section className="card portfolio-edit-card">
          <h4 className="subsection-title">Editeaza portofoliu</h4>
          <form className="portfolio-form" onSubmit={onSaveEdit}>
            <label htmlFor="portfolio-edit-name">Nume</label>
            <input
              id="portfolio-edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={needsAuth || savingEdit}
            />
            {editError && <p className="field-error">{editError}</p>}

            <label htmlFor="portfolio-edit-desc">Descriere</label>
            <textarea
              id="portfolio-edit-desc"
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={needsAuth || savingEdit}
            />

            <div className="form-actions">
              <button type="submit" disabled={needsAuth || savingEdit} className="btn-primary">
                {savingEdit ? "Se salveaza..." : "Salveaza"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelEdit}
                disabled={savingEdit}
              >
                Anuleaza
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <h4 className="subsection-title">Lista portofolii</h4>
        {loading ? (
          <p className="muted">Se incarca...</p>
        ) : items.length === 0 ? (
          <p className="muted">Nu ai inca portofolii. Creeaza unul mai sus.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th>Descriere</th>
                  <th>Actualizat</th>
                  <th aria-label="Actiuni" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="cell-muted">{p.description || "—"}</td>
                    <td className="cell-muted">{formatDate(p.updated_at)}</td>
                    <td className="cell-actions">
                      <Link className="btn-link" to={`/portfolios/${p.id}/holdings`}>
                        Detineri
                      </Link>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => startEdit(p)}
                        disabled={needsAuth || editingId === p.id}
                      >
                        Editeaza
                      </button>
                      <button
                        type="button"
                        className="btn-link danger"
                        onClick={() => void onDelete(p)}
                        disabled={needsAuth}
                      >
                        Sterge
                      </button>
                    </td>
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
