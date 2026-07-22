(() => {
  const STYLE_ID = "dg-admin-dashboard-calendar-layout"

  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    @media (min-width: 1280px) {
      #admin-dashboard-calendar-preview-root > section {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 18rem !important;
        grid-template-rows: auto auto minmax(0, 1fr) !important;
        column-gap: 1.5rem !important;
        row-gap: 0 !important;
        position: relative !important;
        align-items: stretch !important;
        margin-bottom: 2.5rem !important;
        padding: 0 !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      #admin-dashboard-calendar-preview-root > section::before,
      #admin-dashboard-calendar-preview-root > section::after {
        content: "";
        z-index: 0;
        border: 1px solid #e5e7eb;
        border-radius: 1rem;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
      }

      #admin-dashboard-calendar-preview-root > section::before {
        grid-column: 1;
        grid-row: 1 / 4;
      }

      #admin-dashboard-calendar-preview-root > section::after {
        grid-column: 2;
        grid-row: 1 / 4;
      }

      .dark #admin-dashboard-calendar-preview-root > section::before,
      .dark #admin-dashboard-calendar-preview-root > section::after {
        border-color: #27272a;
        background: #18181b;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(1) {
        display: contents !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(1) > div:first-child {
        grid-column: 1;
        grid-row: 1;
        z-index: 1;
        margin: 1.5rem 1.5rem 1rem !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(1) > div:last-child {
        grid-column: 2;
        grid-row: 1;
        z-index: 1;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        margin: 1.5rem 1.5rem 1rem !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(1) > div:last-child > a {
        width: 100% !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(2) {
        grid-column: 2;
        grid-row: 2 / 4;
        z-index: 1;
        min-height: 0 !important;
        margin: 0 1.5rem 1.5rem !important;
        padding: 0 !important;
        overflow-y: auto !important;
        border: 0 !important;
        background: transparent !important;
        color: inherit !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(2) > div:first-child {
        display: block !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(2) > div:first-child > a {
        display: none !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(2) > div:nth-child(2) {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(3) {
        grid-column: 1;
        grid-row: 2;
        z-index: 1;
        margin: 0 1.5rem !important;
      }

      #admin-dashboard-calendar-preview-root > section > div:nth-child(4) {
        grid-column: 1;
        grid-row: 3;
        z-index: 1;
        margin: 0 1.5rem 1.5rem !important;
      }
    }
  `

  document.head.appendChild(style)
})()
