import { DEPARTMENTS, LEAVE_TYPES, VIEW_COPY } from './data.js';

const API_BASE = '/api';

const state = {
  employees: [],
  leaves: [],
  attendanceCache: new Map(),
  employeeLookup: new Map(),
  activeView: 'dashboard',
};

const selectors = {
  navButtons: document.querySelectorAll('.nav-item'),
  viewTitle: document.getElementById('view-title'),
  viewDescription: document.getElementById('view-description'),
  views: document.querySelectorAll('.view'),
  mainSearch: document.getElementById('main-search'),
  dashboard: {
    cards: document.getElementById('dashboard-cards'),
    leaveAlerts: document.getElementById('dashboard-leave-alerts'),
    birthdays: document.getElementById('dashboard-birthdays'),
    refresh: document.getElementById('refresh-dashboard'),
  },
  employees: {
    form: document.getElementById('employee-form'),
    reset: document.getElementById('employee-form-reset'),
    tree: document.getElementById('employee-tree'),
    search: document.getElementById('employee-search'),
  },
  leaves: {
    form: document.getElementById('leave-form'),
    table: document.querySelector('#leave-table tbody'),
    filter: document.getElementById('leave-filter'),
  },
  attendance: {
    form: document.getElementById('attendance-form'),
    table: document.querySelector('#attendance-table tbody'),
    queryForm: document.getElementById('attendance-query'),
    month: document.getElementById('attendance-query-month'),
  },
  payroll: {
    employee: document.getElementById('payroll-employee'),
    summary: document.getElementById('payroll-summary'),
    download: document.getElementById('download-payslip'),
  },
  globalSearch: document.getElementById('global-search'),
  exportButtons: document.querySelectorAll('[data-export]'),
};

const validViews = new Set(Array.from(selectors.views).map((section) => section.dataset.view));

const departmentTemplate = document.getElementById('department-template');

async function apiFetch(endpoint, { method = 'GET', body, headers, parse = 'json' } = {}) {
  const opts = { method, headers: { ...(headers || {}) } };

  if (body !== undefined && !(body instanceof FormData)) {
    opts.body = JSON.stringify(body);
    opts.headers['Content-Type'] = 'application/json';
  } else if (body instanceof FormData) {
    opts.body = body;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, opts);
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const problem = await response.json();
      message = problem.detail || problem.message || message;
    } catch (error) {
      // ignore JSON parsing error and fallback to status text
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (parse === 'blob') {
    return response.blob();
  }

  if (parse === 'text') {
    return response.text();
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function notify(message, type = 'info') {
  const banner = document.createElement('div');
  banner.className = `toast toast--${type}`;
  banner.textContent = message;
  document.body.appendChild(banner);
  requestAnimationFrame(() => {
    banner.classList.add('is-visible');
  });
  setTimeout(() => {
    banner.classList.remove('is-visible');
    setTimeout(() => banner.remove(), 250);
  }, 3000);
}

function normalizeView(view) {
  if (!view) return 'dashboard';
  return validViews.has(view) ? view : 'dashboard';
}

function resolveViewFromHash() {
  return normalizeView(window.location.hash.replace('#', ''));
}

function switchView(requestedView) {
  const view = normalizeView(requestedView);
  const viewChanged = state.activeView !== view;
  state.activeView = view;

  selectors.views.forEach((section) => {
    const isActive = section.dataset.view === view;
    section.hidden = !isActive;
  });

  selectors.navButtons.forEach((btn) => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('is-active', isActive);
    if (isActive) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  if (selectors.mainSearch) {
    selectors.mainSearch.hidden = view !== 'employees';
  }

  if (selectors.dashboard.refresh) {
    selectors.dashboard.refresh.hidden = view !== 'dashboard';
  }

  const copy = VIEW_COPY[view] || { title: 'NovaHRMS', description: '' };
  selectors.viewTitle.textContent = copy.title;
  selectors.viewDescription.textContent = copy.description;
  document.title = `NovaHRMS Control Center — ${copy.title}`;

  if (viewChanged) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function navigate(view) {
  const normalized = normalizeView(view);
  switchView(normalized);
  if (window.location.hash.replace('#', '') !== normalized) {
    window.location.hash = normalized;
  }
}

function buildEmployeeLookup() {
  state.employeeLookup.clear();
  for (const employee of state.employees) {
    state.employeeLookup.set(employee.employeeId, employee);
  }
}

function populateSelect(select, options, { includeBlank = false } = {}) {
  const current = select.value;
  select.innerHTML = '';
  if (includeBlank) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Select';
    select.appendChild(opt);
  }
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value ?? option;
    opt.textContent = option.label ?? option;
    if (option.disabled) {
      opt.disabled = true;
    }
    select.appendChild(opt);
  });
  if (current) {
    select.value = current;
  }
}

function filterEmployees(term) {
  if (!term) {
    return [...state.employees];
  }
  const value = term.toLowerCase();
  return state.employees.filter((employee) => {
    const haystack = [
      employee.employeeId,
      employee.firstName,
      employee.lastName,
      employee.department,
      employee.designation,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(value);
  });
}

function renderEmployeeTree(term = '') {
  const employees = filterEmployees(term);
  const grouped = employees.reduce((acc, employee) => {
    acc.set(employee.department, [...(acc.get(employee.department) || []), employee]);
    return acc;
  }, new Map());

  selectors.employees.tree.innerHTML = '';
  if (!grouped.size) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No employees match your filters yet.';
    selectors.employees.tree.appendChild(empty);
    return;
  }

  grouped.forEach((records, department) => {
    const node = departmentTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('summary').textContent = `${department} • ${records.length} team member${records.length === 1 ? '' : 's'}`;
    const container = node.querySelector('.tree-table__content');
    container.appendChild(buildEmployeeTable(records));
    selectors.employees.tree.appendChild(node);
  });
}

function buildEmployeeTable(records) {
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
        <th scope="col">Designation</th>
        <th scope="col">Email</th>
        <th scope="col">Phone</th>
        <th scope="col">Join date</th>
        <th scope="col">Salary</th>
        <th scope="col">Status</th>
        <th scope="col">Leave balance</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  records
    .sort((a, b) => a.firstName.localeCompare(b.firstName))
    .forEach((employee) => {
      const row = document.createElement('tr');
      row.dataset.employeeId = employee.employeeId;
      row.innerHTML = `
        <td>${employee.employeeId}</td>
        <td>${employee.firstName} ${employee.lastName}</td>
        <td>${employee.designation}</td>
        <td>${employee.email}</td>
        <td>${employee.phone}</td>
        <td>${employee.dateOfJoining}</td>
        <td>$${Number(employee.salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        <td><span class="tag">${employee.status}</span></td>
        <td>${employee.leaveBalance} days</td>
        <td class="table__actions">
          <button class="btn btn--ghost" data-action="edit">Edit</button>
          <button class="btn btn--ghost" data-action="delete">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  return table;
}

function fillEmployeeForm(employee) {
  const form = selectors.employees.form;
  form.mode.value = employee ? 'edit' : 'create';
  form.querySelector('.btn.btn--primary').textContent = employee ? 'Update employee' : 'Save employee';

  const fields = [
    'employeeId',
    'firstName',
    'lastName',
    'department',
    'designation',
    'email',
    'phone',
    'dateOfJoining',
    'dateOfBirth',
    'salary',
    'allowances',
    'deductions',
    'status',
    'leaveBalance',
  ];

  fields.forEach((field) => {
    const input = form.elements[field];
    if (!input) return;
    if (employee) {
      if (field === 'allowances' || field === 'deductions') {
        input.value = Number(employee[field] ?? 0);
      } else if (field === 'leaveBalance') {
        input.value = Number(employee[field] ?? 0);
      } else {
        input.value = employee[field] ?? '';
      }
      if (field === 'employeeId') {
        input.readOnly = true;
      }
    } else {
      if (field === 'status') {
        input.value = 'Active';
      } else if (field === 'leaveBalance') {
        input.value = 24;
      } else {
        input.value = '';
      }
      if (field === 'allowances' || field === 'deductions') {
        input.value = employee ? employee[field] : 0;
      }
      input.readOnly = false;
    }
  });
}

async function loadEmployees() {
  const data = await apiFetch('/employees');
  state.employees = data;
  buildEmployeeLookup();
  renderEmployeeTree(selectors.employees.search.value.trim());
  populateSelect(selectors.employees.form.elements.department, DEPARTMENTS.map((dept) => ({ value: dept, label: dept })), {});
  updateEmployeeSelects();
  renderPayrollSummary();
}

function updateEmployeeSelects() {
  const employeeOptions = state.employees.map((employee) => ({
    value: employee.employeeId,
    label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
  }));

  populateSelect(document.getElementById('leave-employee'), employeeOptions, { includeBlank: true });
  populateSelect(document.getElementById('attendance-employee'), employeeOptions, { includeBlank: true });
  populateSelect(document.getElementById('attendance-query-employee'), employeeOptions, { includeBlank: true });
  populateSelect(selectors.payroll.employee, employeeOptions, { includeBlank: true });
}

async function saveEmployee(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const payload = Object.fromEntries(new FormData(form).entries());
  delete payload.mode;
  payload.salary = Number(payload.salary || 0);
  payload.allowances = Number(payload.allowances || 0);
  payload.deductions = Number(payload.deductions || 0);
  payload.leaveBalance = Number(payload.leaveBalance || 0);

  try {
    if (form.mode.value === 'edit') {
      await apiFetch(`/employees/${payload.employeeId}`, { method: 'PUT', body: payload });
      notify('Employee updated');
    } else {
      await apiFetch('/employees', { method: 'POST', body: payload });
      notify('Employee created');
    }
    form.reset();
    form.mode.value = 'create';
    form.employeeId.readOnly = false;
    await loadEmployees();
    await refreshDashboard();
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function handleEmployeeActions(event) {
  const action = event.target.dataset.action;
  if (!action) return;
  const row = event.target.closest('tr');
  if (!row) return;
  const employeeId = row.dataset.employeeId;
  if (!employeeId) return;
  const employee = state.employeeLookup.get(employeeId);
  if (!employee) return;

  if (action === 'edit') {
    navigate('employees');
    fillEmployeeForm(employee);
    selectors.employees.form.mode.value = 'edit';
  }

  if (action === 'delete') {
    if (!confirm(`Delete employee ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }
    try {
      await apiFetch(`/employees/${employeeId}`, { method: 'DELETE' });
      notify('Employee deleted');
      await loadEmployees();
      await refreshDashboard();
    } catch (error) {
      notify(error.message, 'error');
    }
  }
}

async function loadLeaves() {
  const data = await apiFetch('/leaves');
  state.leaves = data;
  renderLeaveTable();
}

function renderLeaveTable() {
  const filter = selectors.leaves.filter.value;
  selectors.leaves.table.innerHTML = '';
  const rows = state.leaves.filter((leave) => filter === 'all' || leave.status === filter);
  if (!rows.length) {
    const empty = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'No leave requests to display.';
    td.className = 'muted';
    empty.appendChild(td);
    selectors.leaves.table.appendChild(empty);
    return;
  }

  rows.forEach((leave) => {
    const employee = state.employeeLookup.get(leave.employeeId);
    const row = document.createElement('tr');
    const statusClass = leave.status === 'Pending' ? 'status--pending' : leave.status === 'Approved' ? 'status--approved' : 'status--rejected';
    const balance = employee ? `${employee.leaveBalance} days` : '—';
    row.dataset.leaveId = leave.id;
    row.innerHTML = `
      <td>${employee ? `${employee.firstName} ${employee.lastName}` : leave.employeeId}</td>
      <td>${leave.type}</td>
      <td>${leave.startDate} – ${leave.endDate}</td>
      <td><span class="status ${statusClass}">${leave.status}</span></td>
      <td>${balance}</td>
      <td class="table__actions">
        ${leave.status === 'Pending'
          ? '<button class="btn btn--ghost" data-action="approve">Approve</button>\n             <button class="btn btn--ghost" data-action="reject">Reject</button>'
          : ''}
      </td>
    `;
    selectors.leaves.table.appendChild(row);
  });
}

async function submitLeave(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form).entries());
  if (payload.startDate > payload.endDate) {
    notify('Start date must be before end date', 'error');
    return;
  }
  try {
    await apiFetch('/leaves', { method: 'POST', body: payload });
    notify('Leave request submitted');
    form.reset();
    await loadLeaves();
    await loadEmployees();
    await refreshDashboard();
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function updateLeaveStatus(id, status) {
  try {
    await apiFetch(`/leaves/${id}/status`, { method: 'POST', body: { status } });
    notify(`Leave ${status.toLowerCase()}`);
    await loadLeaves();
    await loadEmployees();
    await refreshDashboard();
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function handleLeaveActions(event) {
  const action = event.target.dataset.action;
  if (!action) return;
  const row = event.target.closest('tr');
  if (!row) return;
  const leaveId = row.dataset.leaveId;
  if (!leaveId) return;
  if (action === 'approve' || action === 'reject') {
    await updateLeaveStatus(leaveId, action === 'approve' ? 'Approved' : 'Rejected');
  }
}

async function submitAttendance(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await apiFetch('/attendance', { method: 'POST', body: payload });
    notify('Attendance recorded');
    form.reset();
    state.attendanceCache.clear();
    await refreshDashboard();
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function queryAttendance(event) {
  event.preventDefault();
  const employeeId = document.getElementById('attendance-query-employee').value;
  const monthValue = selectors.attendance.month.value;
  if (!employeeId || !monthValue) {
    notify('Select an employee and month', 'error');
    return;
  }
  const [year, month] = monthValue.split('-');
  const cacheKey = `${employeeId}-${year}-${month}`;
  if (!state.attendanceCache.has(cacheKey)) {
    try {
      const data = await apiFetch(`/attendance/${employeeId}/monthly/${year}/${month}`);
      state.attendanceCache.set(cacheKey, data.records || []);
    } catch (error) {
      notify(error.message, 'error');
      return;
    }
  }
  renderAttendanceTable(state.attendanceCache.get(cacheKey));
}

function renderAttendanceTable(records) {
  selectors.attendance.table.innerHTML = '';
  if (!records || !records.length) {
    const empty = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'No attendance records for this selection.';
    td.className = 'muted';
    empty.appendChild(td);
    selectors.attendance.table.appendChild(empty);
    return;
  }
  records.forEach((record) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.date}</td>
      <td>${record.checkIn}</td>
      <td>${record.checkOut}</td>
      <td>${Number(record.hoursWorked).toFixed(2)}</td>
    `;
    selectors.attendance.table.appendChild(row);
  });
}

async function renderPayrollSummary() {
  const employeeId = selectors.payroll.employee.value;
  selectors.payroll.summary.innerHTML = '';
  selectors.payroll.download.disabled = !employeeId;
  if (!employeeId) return;
  try {
    const data = await apiFetch(`/payroll/${employeeId}`);
    const breakdown = document.createElement('div');
    breakdown.innerHTML = `
      <p><strong>${data.employee}</strong></p>
      <p>Base salary: $${Number(data.base).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      <p>Allowances: $${Number(data.allowances).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      <p>Deductions: $${Number(data.deductions).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      <p><strong>Net pay: $${Number(data.net).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></p>
    `;
    selectors.payroll.summary.appendChild(breakdown);
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function downloadPayslip() {
  const employeeId = selectors.payroll.employee.value;
  if (!employeeId) return;
  try {
    const blob = await apiFetch(`/payroll/${employeeId}/payslip`, { method: 'POST', parse: 'blob' });
    const employee = state.employeeLookup.get(employeeId);
    const filename = `${employee ? employee.firstName.toLowerCase() : 'payslip'}-${employeeId}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Payslip downloaded');
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function refreshDashboard() {
  try {
    const data = await apiFetch('/dashboard');
    renderDashboard(data);
  } catch (error) {
    notify(error.message, 'error');
  }
}

function renderDashboard(data) {
  selectors.dashboard.cards.innerHTML = '';
  const entries = [
    { label: 'Total employees', value: data.totals.employees },
    { label: 'Active employees', value: data.totals.activeEmployees },
    { label: 'Pending leave', value: data.totals.pendingLeaves },
    { label: 'Approved leave (30d)', value: data.totals.leavesTaken },
    { label: 'Average hours this month', value: data.totals.averageHours.toFixed(2) },
  ];
  entries.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'panel';
    card.innerHTML = `
      <header class="panel__header"><h3>${entry.label}</h3></header>
      <strong style="font-size:2rem">${entry.value}</strong>
    `;
    selectors.dashboard.cards.appendChild(card);
  });

  selectors.dashboard.leaveAlerts.innerHTML = '';
  if (!data.leaveAlerts.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'All employees have healthy balances.';
    selectors.dashboard.leaveAlerts.appendChild(li);
  } else {
    data.leaveAlerts.forEach((alert) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${alert.employee}</span><span>${alert.remaining} days left</span>`;
      selectors.dashboard.leaveAlerts.appendChild(li);
    });
  }

  selectors.dashboard.birthdays.innerHTML = '';
  if (!data.birthdays.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'No birthdays in the next 30 days.';
    selectors.dashboard.birthdays.appendChild(li);
  } else {
    data.birthdays.forEach((birthday) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${birthday.employee}</span><span>${birthday.date}</span>`;
      selectors.dashboard.birthdays.appendChild(li);
    });
  }
}

async function exportDataset(dataset, format) {
  try {
    const blob = await apiFetch(`/export/${dataset}?format=${format}`, { parse: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Export generated');
  } catch (error) {
    notify(error.message, 'error');
  }
}

function bindEvents() {
  selectors.navButtons.forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.view));
  });

  selectors.employees.form.addEventListener('submit', saveEmployee);
  selectors.employees.reset.addEventListener('click', () => {
    selectors.employees.form.reset();
    selectors.employees.form.mode.value = 'create';
    selectors.employees.form.employeeId.readOnly = false;
    selectors.employees.form.querySelector('.btn.btn--primary').textContent = 'Save employee';
    selectors.employees.form.allowances.value = 0;
    selectors.employees.form.deductions.value = 0;
    selectors.employees.form.leaveBalance.value = 24;
    selectors.employees.form.status.value = 'Active';
  });

  selectors.employees.search.addEventListener('input', (event) => {
    renderEmployeeTree(event.target.value.trim());
  });

  selectors.employees.tree.addEventListener('click', handleEmployeeActions);

  selectors.leaves.form.addEventListener('submit', submitLeave);
  selectors.leaves.table.addEventListener('click', handleLeaveActions);
  selectors.leaves.filter.addEventListener('change', renderLeaveTable);

  selectors.attendance.form.addEventListener('submit', submitAttendance);
  selectors.attendance.queryForm.addEventListener('submit', queryAttendance);

  selectors.payroll.employee.addEventListener('change', renderPayrollSummary);
  selectors.payroll.download.addEventListener('click', downloadPayslip);

  selectors.dashboard.refresh.addEventListener('click', refreshDashboard);

  selectors.globalSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const term = event.currentTarget.value.trim();
      navigate('employees');
      selectors.employees.search.value = term;
      renderEmployeeTree(term);
      event.preventDefault();
    }
  });

  selectors.exportButtons.forEach((button) => {
    button.addEventListener('click', () => exportDataset(button.dataset.export, button.dataset.format));
  });
}

async function init() {
  bindEvents();
  populateSelect(selectors.employees.form.elements.department, DEPARTMENTS.map((dept) => ({ value: dept, label: dept })), {});
  populateSelect(document.getElementById('leave-type'), LEAVE_TYPES.map((type) => ({ value: type, label: type })), {});
  try {
    await Promise.all([loadEmployees(), loadLeaves(), refreshDashboard()]);
  } catch (error) {
    notify(error.message, 'error');
  }
  const initialView = resolveViewFromHash();
  switchView(initialView);
  if (window.location.hash.replace('#', '') !== initialView) {
    if (typeof history.replaceState === 'function') {
      const base = `${window.location.pathname}${window.location.search}`;
      history.replaceState(null, '', `${base}#${initialView}`);
    } else {
      window.location.hash = initialView;
    }
  }
  window.addEventListener('hashchange', () => {
    const view = resolveViewFromHash();
    if (window.location.hash.replace('#', '') !== view) {
      if (typeof history.replaceState === 'function') {
        const base = `${window.location.pathname}${window.location.search}`;
        history.replaceState(null, '', `${base}#${view}`);
      } else {
        window.location.hash = view;
        return;
      }
    }
    switchView(view);
  });
}

init();
