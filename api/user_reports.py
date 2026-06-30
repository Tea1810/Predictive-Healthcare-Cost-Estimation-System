"""Per-user saved cost reports (Firestore `reports` collection).

Every prediction generates a report; we persist it here so the signed-in user
can revisit, rename and read it later on the Reports page. Stored in the same
``statistics`` database as the prediction stream, but in its own collection
keyed by the owner's Firebase ``uid``.

Listing filters by ``uid`` and sorts in Python (newest first) so we don't need
a Firestore composite index for ``uid == ? ORDER BY created_at``.
"""
from datetime import datetime, timezone

from firebase_admin import firestore

_db = None


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client(database_id="statistics")
    return _db


def _default_name(ts: datetime) -> str:
    return f"Cost report · {ts:%b %d, %Y}"


def save_report(uid: str, *, cost: float, report: str, pdf: bytes,
                contributions: dict | None = None, patient: dict | None = None,
                name: str | None = None) -> str:
    """Persist a generated report (incl. its rendered PDF) and return the doc id.

    The PDF is stored inline as a Firestore Blob — these reports are a few KB,
    well under the 1 MB document limit.
    """
    db = _get_db()
    now = datetime.now(timezone.utc)
    _, ref = db.collection("reports").add({
        "uid": uid,
        "name": name or _default_name(now),
        "cost": cost,
        "report": report,
        "contributions": contributions or {},
        "patient": patient or {},
        "pdf": pdf,
        "created_at": now,
    })
    return ref.id


def list_reports(uid: str) -> list[dict]:
    """All of this user's reports, newest first."""
    db = _get_db()
    docs = db.collection("reports").where("uid", "==", uid).stream()

    items = []
    for d in docs:
        data = d.to_dict()
        created = data.get("created_at")
        # Intentionally omit the heavy `report`/`pdf` fields; the PDF is fetched
        # on demand via get_report_pdf when the user opens a report.
        items.append({
            "id": d.id,
            "name": data.get("name"),
            "cost": data.get("cost"),
            "created_at": created,  # datetime, used for sorting then serialised below
        })

    # Sort newest-first; treat missing timestamps as oldest.
    items.sort(key=lambda r: r["created_at"] or datetime.min.replace(tzinfo=timezone.utc),
               reverse=True)

    for r in items:
        r["created_at"] = r["created_at"].isoformat() if r["created_at"] else None
    return items


def get_report_pdf(uid: str, report_id: str) -> bytes | None:
    """The stored PDF bytes for a report the user owns, else None."""
    db = _get_db()
    snap = db.collection("reports").document(report_id).get()
    if not snap.exists:
        return None
    data = snap.to_dict()
    if data.get("uid") != uid:
        return None
    pdf = data.get("pdf")
    return bytes(pdf) if pdf is not None else None


def rename_report(uid: str, report_id: str, new_name: str) -> bool:
    """Rename a report the user owns. Returns False if it's missing or not theirs."""
    db = _get_db()
    ref = db.collection("reports").document(report_id)
    snap = ref.get()
    if not snap.exists or snap.to_dict().get("uid") != uid:
        return False
    ref.update({"name": new_name})
    return True
