# RAG Documentation

RAG uses:

- LangChain text splitters
- Sentence Transformers embeddings
- Persistent ChromaDB
- Gemini final answer generation

Index lifecycle:

- full rebuild
- incremental update
- status inspection

Low-confidence answers return a safe fallback instead of fabricating content.

