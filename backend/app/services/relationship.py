from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.graph import GraphNodeModel, GraphEdgeModel
from app.models.document import Document
from datetime import datetime

class RelationshipService:
    @staticmethod
    def process_document_relationships(db: Session, document_id: str, title: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes extracted metadata from a document and generates relationships:
        - Person -> Document (mentioned_in)
        - Location -> Document (located_at)
        - Tag -> Document (about)
        - Organization -> Document (associated_with)
        """
        # 1. Create document node
        doc_node_id = f"document_{document_id}"
        doc_node = RelationshipService._get_or_create_node(db, doc_node_id, title, "Document")

        # Extract entities from metadata
        people = metadata.get("people", [])
        organizations = metadata.get("organizations", [])
        locations = metadata.get("locations", [])
        tags = metadata.get("tags", [])

        # Normalize and ensure clean lists
        people = [p.strip() for p in people if p]
        organizations = [o.strip() for o in organizations if o]
        locations = [l.strip() for l in locations if l]
        tags = [t.strip() for t in tags if t]

        nodes = []
        # Create entity nodes
        for p in people:
            nodes.append(RelationshipService._get_or_create_node(db, f"person_{p.lower().replace(' ', '_')}", p, "Person"))
        for o in organizations:
            nodes.append(RelationshipService._get_or_create_node(db, f"organization_{o.lower().replace(' ', '_')}", o, "Organization"))
        for l in locations:
            nodes.append(RelationshipService._get_or_create_node(db, f"location_{l.lower().replace(' ', '_')}", l, "Location"))
        for t in tags:
            nodes.append(RelationshipService._get_or_create_node(db, f"tag_{t.lower().replace(' ', '_')}", t, "Tag"))

        # Create relationship edges
        # Person -> Document (mentioned_in)
        for p in people:
            p_node_id = f"person_{p.lower().replace(' ', '_')}"
            RelationshipService._create_or_update_edge(db, p_node_id, doc_node_id, "mentioned_in")

        # Location -> Document (located_at)
        for l in locations:
            l_node_id = f"location_{l.lower().replace(' ', '_')}"
            RelationshipService._create_or_update_edge(db, l_node_id, doc_node_id, "located_at")

        # Tag -> Document (about)
        for t in tags:
            t_node_id = f"tag_{t.lower().replace(' ', '_')}"
            RelationshipService._create_or_update_edge(db, t_node_id, doc_node_id, "about")

        # Organization -> Document (associated_with)
        for o in organizations:
            o_node_id = f"organization_{o.lower().replace(' ', '_')}"
            RelationshipService._create_or_update_edge(db, o_node_id, doc_node_id, "associated_with")

        db.commit()

        return {"status": "success", "nodes_count": len(nodes) + 1}

    @staticmethod
    def get_visualization_data(db: Session) -> Dict[str, Any]:
        """
        Generates dynamic nodes and edges based on real DB entities and relationships.
        """
        db_nodes = db.query(GraphNodeModel).all()
        db_edges = db.query(GraphEdgeModel).all()
        
        nodes = []
        for n in db_nodes:
            nodes.append({
                "id": n.id,
                "name": n.name,
                "type": n.type,
                "created_at": n.created_at.isoformat() if n.created_at else None
            })
            
        edges = []
        for e in db_edges:
            edges.append({
                "id": f"edge_{e.id}",
                "source": e.source_id,
                "target": e.target_id,
                "type": e.type,
                "weight": e.weight
            })
            
        return {
            "nodes": nodes,
            "edges": edges
        }

    @staticmethod
    def _get_or_create_node(db: Session, node_id: str, name: str, node_type: str) -> GraphNodeModel:
        node = db.query(GraphNodeModel).filter(GraphNodeModel.id == node_id).first()
        if not node:
            node = GraphNodeModel(id=node_id, name=name, type=node_type)
            db.add(node)
            db.flush()
        return node

    @staticmethod
    def _create_or_update_edge(db: Session, source_id: str, target_id: str, edge_type: str):
        # Prevent self loops
        if source_id == target_id:
            return

        edge = db.query(GraphEdgeModel).filter(
            GraphEdgeModel.source_id == source_id,
            GraphEdgeModel.target_id == target_id,
            GraphEdgeModel.type == edge_type
        ).first()

        if edge:
            # Increment weight for frequent connection reinforcement
            edge.weight += 0.5
        else:
            edge = GraphEdgeModel(
                source_id=source_id,
                target_id=target_id,
                type=edge_type,
                weight=1.0
            )
            db.add(edge)
        db.flush()
