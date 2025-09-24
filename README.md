# NovaHRMS

NovaHRMS is a lightweight HR management console that ships with:

- a dashboard with real-time headcount, leave and attendance summaries
- employee management with CRUD workflows, search and a department tree view
- leave management with approval workflow and balance tracking
- attendance capture with monthly rollups per employee
- payroll previews with PDF payslip generation powered by ReportLab
- dataset exports for employees, leaves and attendance in CSV/Excel formats

## Getting started

1. **Install dependencies** (Python 3.10+ recommended):

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Launch the API and static frontend**

   ```bash
   uvicorn server:app --reload
   ```

   The command serves the REST API under `http://127.0.0.1:8000/api/...` and the SPA at `http://127.0.0.1:8000/`.

3. **Open the console**

   Navigate to `http://127.0.0.1:8000/` in your browser. All CRUD actions persist to `data/storage.json`.

## Feature notes

- **Employee directory** – Add, edit and delete employees. Records are grouped by department in a collapsible tree table and can be searched by name, ID or department.
- **Dedicated workspaces** – Navigate via the sidebar or load views directly with URLs such as `/#employees`, `/#attendance` or `/#reports` for deep-linking between modules.
- **Leave workflows** – Submit requests, approve/reject as an administrator and automatically adjust remaining balances. Requests cannot be approved when balances are insufficient.
- **Attendance** – Capture daily attendance with working hour calculations. Quickly retrieve monthly logs per employee.
- **Attendance import** – Upload Excel workbooks to bulk load monthly logs. Rows are matched to employees by ID or full name and merged into existing records.
- **Payroll** – View base pay, allowances and deductions, and export branded payslips in PDF using ReportLab.
- **Reports** – Export the employees, leave requests or attendance logs to CSV or Excel (XLSX via OpenPyXL).

### Attendance Excel import

Navigate to the **Attendance → Import from Excel** panel to upload `.xlsx` or `.xlsm` workbooks. The importer expects:

- Columns labelled `Name` (or `Employee ID`/`Code`), `Date`, `Clock In`, `Clock Out` and optionally `Absent`, `On duty`, `Off duty` or `Status`.
- One row per day, grouped sequentially by employee as exported from biometric devices.
- Any number of worksheets; rows from every sheet in the workbook are processed.

Rows marked as absent (via the `Absent` column or a status of `A/Absent`) record zero hours. When `Clock In`/`Clock Out` is missing, the row is skipped with feedback in the UI. The importer updates existing records when a matching employee/date pair already exists.

## Data storage

All datasets are persisted in `data/storage.json`. Feel free to seed additional employees or wipe the file—the application recreates it with sample data if it is missing.

## Tests

The project is a small full-stack prototype and does not ship automated tests. Use the manual workflow above to validate changes.
