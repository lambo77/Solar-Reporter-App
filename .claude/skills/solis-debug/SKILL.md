---
name: solis-debug
description: Hit a live SolisCloud API endpoint (inverterList, inverterDay, inverterDetail, etc.) and pretty-print the raw response. Use to verify API data shape during UI debugging.
---

The user will provide an endpoint name and optionally a request body. Do the following:

1. Ensure the prototype server is running at http://localhost:3000. If it is not, tell the user to run `node server.js` first.
2. Map the endpoint name to the correct path:
   - inverterList / inverter-list → POST /api/solis/inverter-list with body `{"pageNo":"1","pageSize":"100"}`
   - inverterDetail / inverter-detail → POST /api/solis/inverter-detail with body `{"id":"<id>"}` (ask user for the inverter ID if not provided)
   - inverterDay / inverter-day → POST /api/solis/inverter-day with body `{"id":"<id>","time":"<YYYY-MM-DD>","timezone":0}`
   - inverterMonth / inverter-month → POST /api/solis/inverter-month with body `{"id":"<id>","month":"<YYYY-MM>","timezone":0}`
   - inverterYear / inverter-year → POST /api/solis/inverter-year with body `{"id":"<id>","year":"<YYYY>","timezone":0}`
   - alarmList / alarm-list → POST /api/solis/alarm-list with body `{"pageNo":"1","pageSize":"20"}`
   - stationList / station-list → POST /api/solis/station-list with body `{"pageNo":"1","pageSize":"100"}`
3. Use the PowerShell tool to POST the request and capture the full JSON response.
4. Pretty-print the response and highlight:
   - Any non-zero `code` or `success: false` fields (API-level errors)
   - Null or empty arrays where data is expected
   - The shape of the first record if it's a list response
