# GPIT UI Style Guide & Component Library

## Color Theme

| Role | Hex Code | Usage |
|------|----------|-------|
| **Background** | `#FFFFFF` | Page backgrounds, cards, containers |
| **Primary Text/Buttons** | `#595959` | Save buttons, main actions, headings, body text |
| **Primary Highlight** | `#E91E63` | Active states, highlights, accents, links, focus rings |
| **Secondary Pink** | `#E91E64` | Alternative pink shade for gradients or hover variations |

> **Note:** The primary pink highlight is `#E91E63` (Material Design Pink-500). The specification mentions `#E91E64` as an alternative/application color—these are visually interchangeable with `#E91E63` taking precedence as the primary highlight.

---

## Button Components

*Visual Reference:* 
Use GPIT Create Module Button.png as the base template for all primary buttons. (assest folder)


### Primary Button (Main Action / Save)

**Specifications:**
- **Background:** `#595959` (Charcoal/Dark Gray)
- **Text Color:** `#FFFFFF` (White)
- **Border Radius:** Match the image asset's rounded corners
- **Padding:** Maintain proportions from image reference
- **Font:** System font stack, medium weight

**CSS Implementation:**
```css
.btn-primary,
.btn-save,
.btn-main {
  background-color: #595959;
  color: #FFFFFF;
  border: none;
  /* Visual styling derived from GPIT Create Module Button.png */
  border-radius: 4px; /* Adjust based on image asset */
  padding: 12px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover,
.btn-primary:focus {
  background-color: #4a4a4a; /* 10% darker */
  outline: 2px solid #E91E63;
  outline-offset: 2px;
}

.btn-primary:active {
  background-color: #404040; /* 20% darker */
  transform: translateY(1px);
}

I want all input fields to be on the bottom border.

┌────────────────────────────────┐
│ Dashboard  │  Modules          │
├────────────────────────────────┤
│                  module name
│                      Submodules│ ← right-aligned, clickable
├────────────────────────────────┤
│ [Breadcrumbs]                  │
├────────────────────────────────┤
│ Dashboard / Modules content    │