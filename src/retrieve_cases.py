import os
import pickle
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from utils import CSV_DIR, MODELS_DIR

MODEL_NAME = 'all-MiniLM-L6-v2'

def build_vector_index():
    """
    Encodes all synthetic judgments and saves the embeddings vector store.
    """
    csv_path = os.path.join(CSV_DIR, 'judgments_dataset.csv')
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Judgments dataset not found at {csv_path}. Run generator first.")
        
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} judgments for vector encoding.")
    
    # Load Sentence Transformer
    print(f"Loading SentenceTransformer model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    
    # We will embed the facts of the cases
    texts_to_embed = df['facts'].astype(str).tolist()
    
    print("Generating embeddings for judgments (this may take a minute)...")
    embeddings = model.encode(texts_to_embed, show_progress_bar=True, convert_to_numpy=True)
    
    # Save index structure
    index_data = {
        'model_name': MODEL_NAME,
        'embeddings': embeddings,
        'judgments': df.to_dict(orient='records')
    }
    
    index_path = os.path.join(MODELS_DIR, 'vector_index')
    with open(index_path, 'wb') as f:
        pickle.dump(index_data, f)
        
    print(f"Vector index successfully built and saved to models/vector_index")

def retrieve_similar_judgments(query_text: str, top_k: int = 3) -> list:
    """
    Embeds query_text and retrieves top_k similar judgments.
    """
    index_path = os.path.join(MODELS_DIR, 'vector_index')
    if not os.path.exists(index_path):
        # Fallback if index is not built yet
        return []
        
    with open(index_path, 'rb') as f:
        index_data = pickle.load(f)
        
    model = SentenceTransformer(index_data['model_name'])
    query_embedding = model.encode([query_text], convert_to_numpy=True)[0]
    
    stored_embeddings = index_data['embeddings']
    judgments = index_data['judgments']
    
    # Compute Cosine Similarities
    # norm of query
    q_norm = np.linalg.norm(query_embedding)
    # norms of stored
    s_norms = np.linalg.norm(stored_embeddings, axis=1)
    
    # Dot products
    dot_products = np.dot(stored_embeddings, query_embedding)
    
    # Cosine similarities
    similarities = dot_products / (s_norms * q_norm + 1e-8)
    
    # Get top-k indices
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        judg = judgments[idx].copy()
        judg['similarity_score'] = float(similarities[idx])
        results.append(judg)
        
    return results

if __name__ == "__main__":
    build_vector_index()
