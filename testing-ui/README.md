# Property Management Dashboard (CEO View)

This lightweight UI is a static React + Tailwind dashboard (served directly in the browser) that exercises the deployed **Property AI** and **Master AI** ministries for manual testing.

## Key features

- CEO dashboard: KPI cards, recent activity, compliance alerts, and audit summary.
- Property list: card grid with occupancy badges and quick selection.
- Add property form with address fields, status selector, and duplicate-name check.
- Property details: tabs for overview/units, unit list, and "Add units" / deletion controls.
- Delete workflows: logical delete (system checks placeholder) and hard delete (confirmation phrase).
- Service status tiles for **Property AI** and **Master AI**.

## Running the dashboard locally

1. Start your Property AI service (e.g., `npm run start:dev:property-ai` from the monorepo root).
2. Navigate into this folder: `cd testing-ui`.
3. Serve the static files (any static server works). For example:
   ```bash
   python3 -m http.server 4173
   ```
4. Open `http://localhost:4173` in the browser. The UI will call the Property AI endpoints at `http://localhost:3000` by default.

## Customizing the API endpoint

The base URL is configurable inside `index.html`:

```html
<script>
  window.PROPERTY_API_BASE_URL = 'https://property-ai-service-153551183923.asia-south1.run.app/api';
</script>
```

Change that value if your Property AI (or Master AI health checks) run on another host or port. Reload the page after the change.

## Next steps

1. Add unit-level forms or controls if the backend expands (e.g., batch creation).
2. Wire the Master AI service status tile to a real health endpoint once available.
3. Expand the activity feed with real Pub/Sub events or log history.
