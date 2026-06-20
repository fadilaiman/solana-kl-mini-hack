# Solemandate — Product Requirements Document (PRD)

> **Status:** Planning / Pre-build. This PRD describes a system **to be built**. Nothing here should be read as already implemented; it is the proposed specification for a recurring on-chain direct-debit protocol on Solana.

## What this PRD covers

Solemandate is a proposed **Web3 automated direct-debit protocol** that lets merchants charge customers on a recurring schedule using stablecoins on Solana, with a single one-time customer authorization and platform-absorbed network fees.

This document set is the blueprint a team would follow to design, build, test, and ship the system.

## How to read this folder

| Folder | Purpose |
|--------|---------|
| `00_Overview/` | Why we are building this — vision, problem, goals, success metrics. |
| `01_User_Research/` | Who we are building for — personas, journeys, pain points. |
| `02_Requirements/` | What it must do — functional & non-functional requirements, stories, use cases. |
| `03_Product_Scope/` | Boundaries — what's in, what's out, assumptions, dependencies. |
| `04_UI_UX/` | How it should feel — flows, screens, design and UX rules. |
| `05_Technical/` | How it should be built — architecture, APIs, data model, integrations. |
| `06_Security_Compliance/` | How we keep it safe and lawful. |
| `07_Project_Planning/` | When and in what order — milestones, timeline, release, risks. |
| `08_Testing_QA/` | How we prove it works — acceptance criteria, scenarios, edge cases. |
| `09_Analytics/` | How we measure it — events, metrics, reporting. |
| `10_Appendix/` | Glossary, references, change log. |

## One-paragraph summary

A merchant defines billing terms (amount, token, frequency, number of payments). The platform generates a hosted checkout link. The customer connects a Solana wallet **once** and signs a single SPL-token `approve`, delegating a capped allowance to the platform. A scheduled backend then pulls the fixed amount each cycle via `transferChecked`, paying the network fee itself ("gas-absorbed"). The customer can cancel anytime by revoking the on-chain delegation. The protocol can never charge more than the approved cap.

## Conventions

- All amounts are denominated in the **settlement SPL token** (e.g., USDC). Fiat figures are illustrative.
- Target chain for the initial build: **Solana Devnet**, with Mainnet as a later milestone.
- Language throughout is intentionally **prescriptive and future-tense** ("the system shall / will").
