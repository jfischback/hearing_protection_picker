# OEMS Hearing Protection Picker

A web version of the "Hearing Protection Picker V2" tab of the Hearing Protection Picker Google Sheet. It checks whether a hearing protector is adequate for a worker's 8-hour noise exposure, using OSHA Appendix B and NIOSH derating.

Plain HTML, CSS, and JavaScript with no build step. To deploy on Vercel, import the repo and leave the framework preset as "Other".

- `index.html`: the page
- `calc.js`: the calculation logic, with the sheet cell each piece comes from
- `app.js`: connects the form to the calculation
- `style.css`: the styles
