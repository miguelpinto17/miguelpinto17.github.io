---
title: AI Health Chatbot with Live Dashboard
summary: A neuro-symbolic health assistant that answers from real data and drives a dashboard from natural language.
year: "2025–2026"
featured: false
order: 5
stack: [Python, PostgreSQL, MongoDB, ChromaDB, Ollama, Streamlit]
github: ""
demo: ""
report: ""
---

## The problem

Health and epidemiological data is abundant but hard to interrogate: the useful answer might live in a relational table, in a semi-structured API response, or buried in a scientific document. A plain LLM will happily answer all three, but it hallucinates and can't be trusted on medical questions. I wanted an assistant focused on preventive medicine that only answers from real sources, and that could also drive an analytical dashboard from plain language.

## What I built

A **neuro-symbolic** decision-support system: a deterministic rules layer wrapped around a language model that orchestrates specialized tools.

Every question first hits a **rules engine** that catches the cases a model shouldn't handle on its own — medical emergencies, out-of-domain questions, and FAQs — and answers them directly. Anything else goes to a **tool-selection agent**, which reads the intent and routes to one or more tools:

- **SQL tool** over PostgreSQL for structured data — symptoms, diseases, drugs and side effects, epidemiological statistics, vaccination coverage
- **MongoDB tool** for semi-structured documents — WHO Global Health Observatory indicators and MedlinePlus condition write-ups
- **RAG tool** over a ChromaDB vector store for scientific literature and preventive-medicine guidance, with embeddings plus a semantic reranking step
- **Dashboard tool** that turns a request into filters and updates the live dashboard state

<div class="diagram">
<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A question passes through a rules engine, then a tool-selection agent routes it to SQL, MongoDB or RAG tools, whose results are composed by a local LLM into an answer and a live dashboard update.">
  <defs>
    <marker id="arrowH" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g font-family="Inter, sans-serif" font-size="12" fill="currentColor">
    <rect x="8" y="80" width="90" height="40" rx="8" fill="none" stroke="currentColor"/>
    <text x="53" y="104" text-anchor="middle">Question</text>

    <line x1="98" y1="100" x2="138" y2="100" stroke="currentColor" marker-end="url(#arrowH)"/>

    <rect x="140" y="80" width="100" height="40" rx="8" fill="none" stroke="currentColor"/>
    <text x="190" y="97" text-anchor="middle">Rules</text>
    <text x="190" y="112" text-anchor="middle">engine</text>

    <line x1="240" y1="100" x2="280" y2="100" stroke="currentColor" marker-end="url(#arrowH)"/>

    <rect x="282" y="80" width="100" height="40" rx="8" fill="none" stroke="currentColor"/>
    <text x="332" y="97" text-anchor="middle">Tool-select</text>
    <text x="332" y="112" text-anchor="middle">agent</text>

    <line x1="382" y1="88" x2="500" y2="32" stroke="currentColor" opacity="0.6" marker-end="url(#arrowH)"/>
    <line x1="382" y1="100" x2="500" y2="100" stroke="currentColor" opacity="0.6" marker-end="url(#arrowH)"/>
    <line x1="382" y1="112" x2="500" y2="168" stroke="currentColor" opacity="0.6" marker-end="url(#arrowH)"/>

    <rect x="502" y="12" width="120" height="34" rx="8" fill="none" stroke="currentColor"/>
    <text x="562" y="33" text-anchor="middle">SQL · PostgreSQL</text>
    <rect x="502" y="83" width="120" height="34" rx="8" fill="none" stroke="currentColor"/>
    <text x="562" y="104" text-anchor="middle">MongoDB</text>
    <rect x="502" y="154" width="120" height="34" rx="8" fill="none" stroke="currentColor"/>
    <text x="562" y="175" text-anchor="middle">RAG · ChromaDB</text>

    <line x1="622" y1="29" x2="662" y2="90" stroke="currentColor" opacity="0.5" marker-end="url(#arrowH)"/>
    <line x1="622" y1="100" x2="662" y2="100" stroke="currentColor" opacity="0.5" marker-end="url(#arrowH)"/>
    <line x1="622" y1="171" x2="662" y2="110" stroke="currentColor" opacity="0.5" marker-end="url(#arrowH)"/>
    <text x="690" y="96" text-anchor="middle" font-size="11">LLM</text>
    <text x="690" y="110" text-anchor="middle" font-size="11">answer</text>
  </g>
</svg>
<p class="diagram-caption">Rules first, then an agent routes to SQL, MongoDB or RAG; a local LLM composes the answer and updates the dashboard.</p>
</div>

The language model runs **locally through Ollama** — I compared several small models (Gemma 3 1B, Gemma 3 4B and Qwen 2.5 1.5B) to trade off answer quality, tool-selection reliability and inference speed on local hardware. The whole stack uses **polyglot persistence** on purpose: PostgreSQL for relational data, MongoDB for JSON documents, and ChromaDB for vector search, each chosen for the shape of its data rather than forcing everything into one store. I added **Langfuse** for tracing so I could see, per request, which rules fired, which tools were called, and what context went into the model.

The data itself comes from real public sources — WHO GHO indicators, MedlinePlus, WHO/UNICEF immunization coverage (WUENIC), a drug side-effects dataset and BRFSS — ingested through transformation pipelines, totaling **100k+ records**.

## Results

- A working prototype that combines conversational Q&A, semantic search over literature, and analytical dashboards in one interface
- Natural-language control of the dashboard: asking for a filter or a view updates the panel live, without touching any controls
- Grounded answers — the rules layer and retrieved context cut down on hallucination versus a bare model
- Graded **18/20**

## What I learned

The neuro-symbolic split was the real lesson: putting deterministic rules *in front of* the model (for emergencies and out-of-domain questions) mattered more than any single model choice. The bigger model gave nicer prose, but reliable tool selection and grounding in real data is what makes a health assistant trustworthy — the smallest fast model plus good retrieval beat a larger model answering from memory.

## Stack

Python, PostgreSQL, MongoDB, ChromaDB, Ollama (local LLM), RAG with embeddings + reranking, Streamlit, Langfuse.
