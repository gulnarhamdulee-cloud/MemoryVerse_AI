from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from app.database.connection import get_db
from app.models.document import Document, DocumentMetadata

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Total files count
    total_files = db.query(Document).count()
    
    # 2. Storage used in bytes
    storage_used_res = db.query(func.sum(Document.filesize)).scalar()
    storage_used = storage_used_res if storage_used_res is not None else 0
    
    # 3. Document Type Distribution
    all_files = db.query(Document.filetype).all()
    type_counts = Counter()
    for (ftype,) in all_files:
        if not ftype:
            label = "Unknown"
        elif "pdf" in ftype:
            label = "PDF"
        elif "word" in ftype or "docx" in ftype or ftype.endswith("document"):
            label = "Word"
        elif "text" in ftype or ftype == "text/plain":
            label = "Text"
        elif "image" in ftype:
            label = "Image"
        else:
            label = ftype.split("/")[-1].upper()
        type_counts[label] += 1
        
    doc_type_distribution = [{"name": name, "value": val} for name, val in type_counts.items()]

    # 4. Recent uploads (limit to 5)
    recent_docs = db.query(Document).order_by(Document.uploaded_at.desc()).limit(5).all()
    recent_uploads = []
    for doc in recent_docs:
        recent_uploads.append({
            "id": doc.id,
            "filename": doc.filename,
            "filepath": doc.filepath,
            "filetype": doc.filetype,
            "filesize": doc.filesize,
            "uploaded_at": doc.uploaded_at
        })

    # 5. Extract metadata aggregates (Tags, People, Locations)
    all_metadata = db.query(DocumentMetadata).all()
    
    tags_counter = Counter()
    people_counter = Counter()
    locations_counter = Counter()
    
    for meta in all_metadata:
        if meta.tags:
            for t in meta.tags.split(","):
                if t.strip():
                    tags_counter[t.strip()] += 1
        if meta.people:
            for p in meta.people.split(","):
                if p.strip():
                    people_counter[p.strip()] += 1
        if meta.locations:
            for l in meta.locations.split(","):
                if l.strip():
                    locations_counter[l.strip()] += 1

    top_tags = [{"name": name, "count": count} for name, count in tags_counter.most_common(10)]
    top_people = [{"name": name, "count": count} for name, count in people_counter.most_common(10)]
    top_locations = [{"name": name, "count": count} for name, count in locations_counter.most_common(10)]

    # 6. AI Insights Generation
    insights = []
    insights.append(f"You uploaded {total_files} document{'s' if total_files != 1 else ''}.")
    
    if tags_counter:
        top_tag, tag_count = tags_counter.most_common(1)[0]
        insights.append(f"{top_tag} appears in {tag_count} document{'s' if tag_count != 1 else ''}.")
    if locations_counter:
        top_loc, loc_count = locations_counter.most_common(1)[0]
        insights.append(f"{top_loc} appears in {loc_count} memor{'ies' if loc_count != 1 else 'y'}.")
    if people_counter:
        top_person, person_count = people_counter.most_common(1)[0]
        insights.append(f"{top_person} is mentioned in {person_count} file{'s' if person_count != 1 else ''}.")

    return {
        "totalFiles": total_files,
        "storageUsed": storage_used,
        "recentUploads": recent_uploads,
        "documentTypeDistribution": doc_type_distribution,
        "topTags": top_tags,
        "topPeople": top_people,
        "topLocations": top_locations,
        "insights": insights
    }
