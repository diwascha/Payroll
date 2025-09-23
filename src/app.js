import {
  dashboardMetrics,
  executiveHighlights,
  workforceMoments,
  analytics,
  employees,
  payrollRuns,
  attendanceHeatmap,
  performanceReviews,
  systemSettings
} from './data.js';

const viewContainer = document.getElementById('view-container');
const navButtons = document.querySelectorAll('.nav-item');
const sectionTitle = document.querySelector('[data-section-title]');
const sectionSubtitle = document.querySelector('.workspace__subtitle');
const appShell = document.querySelector('.app-shell');

const viewConfigurations = {
  dashboard: {
    title: 'Executive Overview',
    subtitle:
      'Command center for your HR operations, workforce health, payroll, and compliance insights.',
    render: renderDashboard
  },
  employees: {
    title: 'Workforce Intelligence',
    subtitle: 'Talent directory enriched with squad health, sentiment, and availability.',
    render: renderEmployees,
    init: initEmployeesView
  },
  payroll: {
    title: 'Payroll Control Center',
    subtitle: 'Audit-ready payroll operations with anomaly detection and funding visibility.',
    render: renderPayroll
  },
  attendance: {
    title: 'Time & Presence',
    subtitle: 'Compliance-grade attendance orchestration with predictive coverage insights.',
    render: renderAttendance
  },
  performance: {
    title: 'Performance & Growth',
    subtitle: 'Talent calibration, growth signals, and goal execution intelligence.',
    render: renderPerformance
  },
  settings: {
    title: 'Control Center',
    subtitle: 'Security, workflow automation, billing, and platform governance controls.',
    render: renderSettings,
    init: initSettingsView
  }
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.view;
    setActiveNav(button);
    changeView(view);
  });
});

const collapseButton = document.querySelector('.sidebar__collapse');
if (collapseButton) {
  collapseButton.addEventListener('click', () => {
    appShell.classList.toggle('is-collapsed');
  });
}

const floatingInsight = document.getElementById('floating-insight');
const floatingClose = document.querySelector('.floating-insight__close');
if (floatingClose && floatingInsight) {
  floatingClose.addEventListener('click', () => {
    floatingInsight.classList.add('floating-insight--hidden');
  });
}

if (floatingInsight) {
  setTimeout(() => {
    floatingInsight.classList.add('floating-insight--visible');
  }, 600);
}

changeView('dashboard');

function setActiveNav(activeButton) {
  navButtons.forEach((btn) => btn.classList.remove('active'));
  activeButton.classList.add('active');
}

function changeView(viewKey) {
  const configuration = viewConfigurations[viewKey];
  if (!configuration) return;

  sectionTitle.textContent = configuration.title;
  sectionSubtitle.textContent = configuration.subtitle;
  viewContainer.innerHTML = configuration.render();

  if (configuration.init) {
    configuration.init();
  }
}

function renderDashboard() {
  const totalSpend = analytics.payrollDrilldown.reduce((sum, item) => sum + item.value, 0);
  const pipelineMax = Math.max(...workforceMoments.hiringPipeline.map((stage) => stage.count));

  return `
    <div class="grid grid--dashboard">
      <section class="panel panel--wide">
        <header class="panel__header">
          <div>
            <h2>People Health Summary</h2>
            <p>AI-augmented overview of workforce health, payroll accuracy, and sentiment shifts.</p>
          </div>
          <span class="pill pill--glow">Live Sync</span>
        </header>
        <div class="panel__content">
          <div class="metric-grid">
            ${dashboardMetrics.map(renderMetricCard).join('')}
          </div>
          <div class="insights-grid">
            <div class="panel panel--nested">
              <header class="panel__subheader">
                <h3>Headcount Trajectory</h3>
                <span class="trend-indicator trend-indicator--up">+12% QoQ</span>
              </header>
              ${renderHeadcountChart(analytics.monthlyHeadcount)}
            </div>
            <div class="panel panel--nested">
              <header class="panel__subheader">
                <h3>Spend Mix</h3>
                <span class="pill pill--subtle">€${totalSpend.toLocaleString()} this cycle</span>
              </header>
              ${renderPayrollBreakdown(analytics.payrollDrilldown)}
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <header class="panel__header">
          <div>
            <h2>Executive Signals</h2>
            <p>Critical talent and compliance updates curated for leadership.</p>
          </div>
          <button class="workspace__button workspace__button--ghost workspace__button--sm">
            <span class="icon icon--download"></span>
            Export Pack
          </button>
        </header>
        <div class="panel__content panel__content--stacked">
          <div class="span-metrics">
            ${executiveHighlights.spanMetrics.map(renderSpanMetric).join('')}
          </div>
          <div class="list-block">
            <h3>Upcoming Actions</h3>
            <ul class="list">
              ${executiveHighlights.upcomingEvents
                .map(
                  (event) => `
                    <li class="list__item">
                      <div>
                        <p class="list__title">${event.title}</p>
                        <p class="list__subtitle">Owner · ${event.owner}</p>
                      </div>
                      <span class="pill pill--subtle">Workflow</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
          <div class="list-block">
            <h3>Engagement Pulse</h3>
            <div class="engagement-signals">
              ${executiveHighlights.engagementSignals.map(renderEngagementSignal).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel--stack">
        <header class="panel__header">
          <div>
            <h2>Workforce Moments</h2>
            <p>People-centric signals surfaced by NovaHR AI.</p>
          </div>
          <button class="workspace__button workspace__button--ghost workspace__button--sm">
            View Playbooks
          </button>
        </header>
        <div class="panel__content panel__content--stacked">
          <div class="list-block">
            <h3>Anniversaries</h3>
            <ul class="list list--compact">
              ${workforceMoments.anniversaries
                .map(
                  (moment) => `
                    <li class="list__item">
                      <div>
                        <p class="list__title">${moment.name}</p>
                        <p class="list__subtitle">${moment.role}</p>
                      </div>
                      <span class="pill pill--outline">${moment.tenure}</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
          <div class="list-block">
            <h3>Upcoming Time Off</h3>
            <ul class="list list--compact">
              ${workforceMoments.upcomingTimeOff
                .map(
                  (moment) => `
                    <li class="list__item">
                      <div>
                        <p class="list__title">${moment.name}</p>
                        <p class="list__subtitle">${moment.role}</p>
                      </div>
                      <span class="pill pill--subtle">${moment.date} · ${moment.length}</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
          <div class="list-block">
            <h3>Hiring Pipeline</h3>
            <div class="pipeline">
              ${workforceMoments.hiringPipeline
                .map(
                  (stage) => `
                    <div class="pipeline__row">
                      <span>${stage.stage}</span>
                      <div class="pipeline__bar">
                        <div class="pipeline__fill" style="width: ${Math.round((stage.count / pipelineMax) * 100)}%"></div>
                      </div>
                      <span class="pipeline__value">${stage.count}</span>
                    </div>
                  `
                )
                .join('')}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderMetricCard(metric) {
  const iconClass = `icon icon--${metric.icon}`;
  return `
    <article class="metric-card">
      <div class="metric-card__icon ${iconClass}"></div>
      <p class="metric-card__label">${metric.label}</p>
      <p class="metric-card__value">${metric.value}</p>
      <span class="metric-card__trend">${metric.trend}</span>
    </article>
  `;
}

function renderSpanMetric(metric) {
  return `
    <div class="span-metric">
      <p class="span-metric__label">${metric.label}</p>
      <p class="span-metric__value">${metric.value}</p>
      <span class="pill pill--outline">${metric.badge}</span>
    </div>
  `;
}

function renderEngagementSignal(signal) {
  const trendClass = signal.delta >= 0 ? 'trend-indicator--up' : 'trend-indicator--down';
  const trendSymbol = signal.delta >= 0 ? '+' : '';
  return `
    <div class="engagement-signal">
      <div>
        <p class="engagement-signal__team">${signal.team}</p>
        <p class="engagement-signal__label">Team engagement score</p>
      </div>
      <div class="engagement-signal__score">${signal.score}</div>
      <span class="trend-indicator ${trendClass}">${trendSymbol}${signal.delta}</span>
    </div>
  `;
}

function renderHeadcountChart(points) {
  const max = Math.max(...points.map((point) => point.value));
  return `
    <div class="chart chart--bar">
      ${points
        .map((point) => {
          const height = Math.round((point.value / max) * 100);
          return `
            <div class="chart__column" title="${point.value} FTEs">
              <div class="chart__value" style="height: ${height}%">
                <span>${point.value}</span>
              </div>
              <p class="chart__label">${point.month}</p>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderPayrollBreakdown(buckets) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  return `
    <ul class="breakdown">
      ${buckets
        .map((bucket) => {
          const width = Math.round((bucket.value / total) * 100);
          return `
            <li class="breakdown__item">
              <div>
                <p class="breakdown__label">${bucket.label}</p>
                <p class="breakdown__value">€${bucket.value.toLocaleString()}</p>
              </div>
              <div class="breakdown__bar">
                <div class="breakdown__fill" style="width: ${width}%"></div>
              </div>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function renderEmployees() {
  const departments = Array.from(new Set(employees.map((employee) => employee.department))).sort();
  const locations = Array.from(new Set(employees.map((employee) => employee.location))).sort();
  const statuses = Array.from(new Set(employees.map((employee) => employee.status)));

  return `
    <div class="grid grid--two-thirds">
      <section class="panel panel--wide">
        <header class="panel__header">
          <div>
            <h2>Workforce Directory</h2>
            <p>Searchable roster enriched with squads, geo-distribution, and availability.</p>
          </div>
          <div class="panel__cta-group">
            <span class="pill pill--subtle"><span data-employee-count>${employees.length}</span> people</span>
            <button class="workspace__button workspace__button--ghost workspace__button--sm">
              <span class="icon icon--download"></span>
              Export CSV
            </button>
          </div>
        </header>
        <div class="panel__content">
          <div class="toolbar">
            <div class="input-with-icon">
              <span class="icon icon--search"></span>
              <input id="employee-search" type="search" placeholder="Search name, role, squad" />
            </div>
            <select id="employee-department" class="select">
              <option value="all">All departments</option>
              ${departments.map((dept) => `<option value="${dept}">${dept}</option>`).join('')}
            </select>
            <select id="employee-location" class="select">
              <option value="all">All locations</option>
              ${locations.map((loc) => `<option value="${loc}">${loc}</option>`).join('')}
            </select>
            <select id="employee-status" class="select">
              <option value="all">Any status</option>
              ${statuses.map((status) => `<option value="${status}">${status}</option>`).join('')}
            </select>
            <button class="workspace__button workspace__button--ghost workspace__button--sm">
              <span class="icon icon--spark"></span>
              Smart Segments
            </button>
          </div>
          <div class="table">
            <div class="table__head">
              <span>Team Member</span>
              <span>Role</span>
              <span>Department</span>
              <span>Status</span>
              <span>Location</span>
            </div>
            <div class="table__body" id="employee-table-body">
              ${renderEmployeeRows(employees)}
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel--stack">
        <header class="panel__header">
          <div>
            <h2>Talent Composition</h2>
            <p>Distribution of the filtered view across departments and availability.</p>
          </div>
        </header>
        <div class="panel__content panel__content--stacked">
          <div>
            <h3>By Department</h3>
            <div id="department-breakdown" class="list list--compact">
              ${renderDepartmentBreakdown(employees)}
            </div>
          </div>
          <div>
            <h3>Availability</h3>
            <div id="availability-badges" class="status-badges">
              ${renderStatusBadges(employees)}
            </div>
          </div>
          <div>
            <h3>Top Squads</h3>
            <ul class="list list--compact" id="squad-highlights">
              ${renderSquadHighlights(employees)}
            </ul>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderEmployeeRows(dataset) {
  return dataset
    .map((employee) => {
      return `
        <div class="table__row">
          <div class="table__cell table__cell--main">
            <div class="avatar avatar--sm">
              <img src="https://i.pravatar.cc/100?u=${employee.id}" alt="${employee.name}" />
            </div>
            <div>
              <p class="table__title">${employee.name}</p>
              <p class="table__subtitle">${employee.id}</p>
            </div>
          </div>
          <div class="table__cell">
            <p class="table__title">${employee.role}</p>
            <p class="table__subtitle">${employee.squad}</p>
          </div>
          <div class="table__cell">
            <p class="table__title">${employee.department}</p>
            <p class="table__subtitle">${employee.email}</p>
          </div>
          <div class="table__cell">
            <span class="status status--${employee.status.replace(/\s/g, '').toLowerCase()}">${employee.status}</span>
          </div>
          <div class="table__cell">
            <p class="table__title">${employee.location}</p>
            <p class="table__subtitle">${employee.level}</p>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderDepartmentBreakdown(dataset) {
  const total = dataset.length || 1;
  const counts = dataset.reduce((acc, item) => {
    acc[item.department] = (acc[item.department] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([department, count]) => {
      const ratio = Math.round((count / total) * 100);
      return `
        <div class="breakdown-line">
          <div>
            <p class="breakdown-line__label">${department}</p>
            <p class="breakdown-line__value">${count} people</p>
          </div>
          <div class="breakdown-line__meter">
            <span style="width: ${ratio}%"></span>
          </div>
          <span class="breakdown-line__ratio">${ratio}%</span>
        </div>
      `;
    })
    .join('');
}

function renderStatusBadges(dataset) {
  const counts = dataset.reduce((acc, employee) => {
    acc[employee.status] = (acc[employee.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([status, count]) => {
      const statusClass = status.replace(/\s/g, '').toLowerCase();
      return `<span class="status status--pill status--${statusClass}">${status} · ${count}</span>`;
    })
    .join('');
}

function renderSquadHighlights(dataset) {
  const counts = dataset.reduce((acc, employee) => {
    acc[employee.squad] = (acc[employee.squad] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(
      ([squad, count]) => `
        <li class="list__item">
          <div>
            <p class="list__title">${squad}</p>
            <p class="list__subtitle">Squad</p>
          </div>
          <span class="pill pill--subtle">${count}</span>
        </li>
      `
    )
    .join('');
}

function initEmployeesView() {
  const searchInput = document.getElementById('employee-search');
  const departmentSelect = document.getElementById('employee-department');
  const locationSelect = document.getElementById('employee-location');
  const statusSelect = document.getElementById('employee-status');
  const tableBody = document.getElementById('employee-table-body');
  const countBadge = document.querySelector('[data-employee-count]');
  const departmentBreakdown = document.getElementById('department-breakdown');
  const availabilityBadges = document.getElementById('availability-badges');
  const squadHighlights = document.getElementById('squad-highlights');

  const filters = {
    query: '',
    department: 'all',
    location: 'all',
    status: 'all'
  };

  const applyFilters = () => {
    const filtered = employees.filter((employee) => {
      const matchesQuery = `${employee.name} ${employee.role} ${employee.squad}`
        .toLowerCase()
        .includes(filters.query);
      const matchesDepartment = filters.department === 'all' || employee.department === filters.department;
      const matchesLocation = filters.location === 'all' || employee.location === filters.location;
      const matchesStatus = filters.status === 'all' || employee.status === filters.status;
      return matchesQuery && matchesDepartment && matchesLocation && matchesStatus;
    });

    tableBody.innerHTML = renderEmployeeRows(filtered);
    countBadge.textContent = filtered.length;
    departmentBreakdown.innerHTML = renderDepartmentBreakdown(filtered);
    availabilityBadges.innerHTML = renderStatusBadges(filtered);
    squadHighlights.innerHTML = renderSquadHighlights(filtered);
  };

  searchInput.addEventListener('input', (event) => {
    filters.query = event.target.value.trim().toLowerCase();
    applyFilters();
  });

  departmentSelect.addEventListener('change', (event) => {
    filters.department = event.target.value;
    applyFilters();
  });

  locationSelect.addEventListener('change', (event) => {
    filters.location = event.target.value;
    applyFilters();
  });

  statusSelect.addEventListener('change', (event) => {
    filters.status = event.target.value;
    applyFilters();
  });
}

function renderPayroll() {
  return `
    <div class="grid grid--two-thirds">
      <section class="panel panel--wide">
        <header class="panel__header">
          <div>
            <h2>Payroll Operations</h2>
            <p>Automated pay cycles with proactive anomaly detection and compliance safeguards.</p>
          </div>
          <div class="panel__cta-group">
            <button class="workspace__button workspace__button--ghost workspace__button--sm">
              <span class="icon icon--spark"></span>
              Run Preview
            </button>
            <button class="workspace__button workspace__button--primary workspace__button--sm">
              <span class="icon icon--play"></span>
              Approve Funding
            </button>
          </div>
        </header>
        <div class="panel__content">
          <div class="metric-grid metric-grid--compact">
            ${analytics.payrollDrilldown.map(renderPayrollStat).join('')}
          </div>
          <div class="table table--flush">
            <div class="table__head">
              <span>Cycle</span>
              <span>Status</span>
              <span>Employees</span>
              <span>Net Pay</span>
              <span>Variance</span>
            </div>
            <div class="table__body">
              ${payrollRuns.map(renderPayrollRow).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel--stack">
        <header class="panel__header">
          <div>
            <h2>Run Checklist</h2>
            <p>Automated controls executed before funding.</p>
          </div>
        </header>
        <div class="panel__content panel__content--stacked">
          <ul class="list list--compact">
            ${[
              { label: 'Variance vs last cycle', status: 'Cleared', icon: 'shield' },
              { label: 'Compliance validations', status: '4 Pending', icon: 'flag' },
              { label: 'Benefit adjustments', status: 'Signed-off', icon: 'spark' }
            ]
              .map(
                (item) => `
                  <li class="list__item">
                    <div>
                      <p class="list__title">${item.label}</p>
                      <p class="list__subtitle">${item.status}</p>
                    </div>
                    <span class="icon icon--${item.icon}"></span>
                  </li>
                `
              )
              .join('')}
          </ul>
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Recurring Deductions</h3>
              <span class="pill pill--subtle">Updated today</span>
            </header>
            <ul class="list list--compact">
              ${[
                { label: 'Pension Contributions', value: '€12,400' },
                { label: 'Healthcare Premiums', value: '€7,980' },
                { label: 'Equity Withholdings', value: '€4,150' }
              ]
                .map(
                  (item) => `
                    <li class="list__item">
                      <p class="list__title">${item.label}</p>
                      <span class="pill pill--outline">${item.value}</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderPayrollStat(bucket) {
  return `
    <article class="metric-card metric-card--compact">
      <p class="metric-card__label">${bucket.label}</p>
      <p class="metric-card__value">€${bucket.value.toLocaleString()}</p>
      <span class="metric-card__trend">${Math.round((bucket.value / 1000) * 10) / 10}k / mo</span>
    </article>
  `;
}

function renderPayrollRow(run) {
  return `
    <div class="table__row">
      <div class="table__cell">
        <p class="table__title">${run.cycle}</p>
        <p class="table__subtitle">Pay date · ${run.payDate}</p>
      </div>
      <div class="table__cell">
        <span class="status status--${run.status.replace(/\s/g, '').toLowerCase()}">${run.status}</span>
      </div>
      <div class="table__cell">
        <p class="table__title">${run.employees}</p>
        <p class="table__subtitle">Employees</p>
      </div>
      <div class="table__cell">
        <p class="table__title">${run.netPay}</p>
        <p class="table__subtitle">Net payment</p>
      </div>
      <div class="table__cell">
        <span class="trend-indicator ${run.variance.startsWith('-') ? 'trend-indicator--down' : 'trend-indicator--up'}">${run.variance}</span>
      </div>
    </div>
  `;
}

function renderAttendance() {
  return `
    <div class="grid grid--two-thirds">
      <section class="panel panel--wide">
        <header class="panel__header">
          <div>
            <h2>Coverage Heatmap</h2>
            <p>Attendance compliance by teams across the last seven days.</p>
          </div>
          <span class="pill pill--subtle">Auto-synced hourly</span>
        </header>
        <div class="panel__content">
          <div class="heatmap">
            ${attendanceHeatmap.map(renderHeatmapRow).join('')}
          </div>
        </div>
      </section>

      <section class="panel panel--stack">
        <header class="panel__header">
          <div>
            <h2>Compliance Breakdown</h2>
            <p>On-time arrivals vs exceptions for the active pay cycle.</p>
          </div>
        </header>
        <div class="panel__content panel__content--stacked">
          <div class="attendance-ratio">
            ${analytics.attendanceCompliance
              .map(
                (item) => `
                  <div class="attendance-ratio__item">
                    <span class="attendance-ratio__label">${item.label}</span>
                    <div class="attendance-ratio__meter">
                      <span style="width: ${item.value}%"></span>
                    </div>
                    <span class="attendance-ratio__value">${item.value}%</span>
                  </div>
                `
              )
              .join('')}
          </div>
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Upcoming Time Off</h3>
              <span class="pill pill--outline">Auto-approved</span>
            </header>
            <ul class="list list--compact">
              ${workforceMoments.upcomingTimeOff
                .map(
                  (item) => `
                    <li class="list__item">
                      <div>
                        <p class="list__title">${item.name}</p>
                        <p class="list__subtitle">${item.role}</p>
                      </div>
                      <span class="pill pill--subtle">${item.date} · ${item.length}</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderHeatmapRow(team) {
  return `
    <div class="heatmap__row">
      <div class="heatmap__team">
        <p class="heatmap__label">${team.name}</p>
        <span class="pill pill--subtle">${team.compliance}%</span>
      </div>
      <div class="heatmap__cells">
        ${team.pattern
          .map((value) => `<span class="heatmap__cell" style="--heat-value: ${value}"></span>`)
          .join('')}
      </div>
    </div>
  `;
}

function renderPerformance() {
  return `
    <div class="grid grid--two-thirds">
      <section class="panel panel--wide">
        <header class="panel__header">
          <div>
            <h2>Growth Reviews</h2>
            <p>High fidelity review summaries synthesised for calibration sessions.</p>
          </div>
          <button class="workspace__button workspace__button--ghost workspace__button--sm">
            <span class="icon icon--spark"></span>
            Launch Calibration
          </button>
        </header>
        <div class="panel__content">
          <div class="performance-grid">
            ${performanceReviews.map(renderPerformanceCard).join('')}
          </div>
        </div>
      </section>

      <section class="panel panel--stack">
        <header class="panel__header">
          <div>
            <h2>Capability Matrix</h2>
            <p>Skill focus areas and readiness signals for the leadership team.</p>
          </div>
        </header>
        <div class="panel__content panel__content--stacked">
          <div class="capability-chart">
            ${['Leadership', 'Delivery', 'Craft', 'Product Sense', 'Customer IQ']
              .map(
                (capability, index) => `
                  <div class="capability-chart__row">
                    <span>${capability}</span>
                    <div class="capability-chart__meter">
                      <span style="width: ${70 + index * 6}%"></span>
                    </div>
                    <span class="capability-chart__value">${70 + index * 6}%</span>
                  </div>
                `
              )
              .join('')}
          </div>
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Development Sprints</h3>
              <span class="pill pill--subtle">In-flight</span>
            </header>
            <ul class="list list--compact">
              ${[
                { name: 'Managers Guild', progress: 76 },
                { name: 'IC Growth Tracks', progress: 62 },
                { name: 'Customer Academy', progress: 48 }
              ]
                .map(
                  (item) => `
                    <li class="list__item">
                      <p class="list__title">${item.name}</p>
                      <div class="micro-progress"><span style="width: ${item.progress}%"></span></div>
                      <span class="pill pill--outline">${item.progress}%</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderPerformanceCard(review) {
  return `
    <article class="performance-card">
      <div class="performance-card__header">
        <div class="avatar avatar--md">
          <img src="https://i.pravatar.cc/120?u=${review.name}" alt="${review.name}" />
        </div>
        <div>
          <p class="performance-card__name">${review.name}</p>
          <p class="performance-card__role">${review.role}</p>
        </div>
        <span class="pill pill--outline">${review.potential} Potential</span>
      </div>
      <div class="performance-card__score">
        <span>${review.score}</span>
        <p>Performance Index</p>
      </div>
      <p class="performance-card__summary">${review.summary}</p>
      <div class="micro-progress"><span style="width: ${review.score * 20}%"></span></div>
      <p class="performance-card__focus">Focus: ${review.focus}</p>
    </article>
  `;
}

function renderSettings() {
  const usage = Math.round((systemSettings.billing.seatsUsed / systemSettings.billing.seatsTotal) * 100);
  return `
    <div class="grid grid--two-thirds">
      <section class="panel panel--wide">
        <header class="panel__header">
          <div>
            <h2>Platform Governance</h2>
            <p>Enterprise controls for security, workflows, and billing.</p>
          </div>
          <button class="workspace__button workspace__button--ghost workspace__button--sm">
            <span class="icon icon--spark"></span>
            Audit Logs
          </button>
        </header>
        <div class="panel__content settings-grid">
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Security Controls</h3>
              <span class="pill pill--subtle">SSO enforced</span>
            </header>
            <div class="toggle-group">
              ${systemSettings.security
                .map(
                  (item) => `
                    <button class="toggle ${item.enabled ? 'is-active' : ''}" data-toggle-setting>
                      <span class="toggle__thumb"></span>
                      <div>
                        <p class="toggle__label">${item.name}</p>
                        <p class="toggle__status">${item.enabled ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </button>
                  `
                )
                .join('')}
            </div>
          </div>
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Workflow Automations</h3>
              <span class="pill pill--outline">AI assisted</span>
            </header>
            <ul class="list list--compact">
              ${systemSettings.workflows
                .map(
                  (workflow) => `
                    <li class="list__item">
                      <div>
                        <p class="list__title">${workflow.name}</p>
                        <p class="list__subtitle">Runs · ${workflow.runs}</p>
                      </div>
                      <span class="status status--${workflow.status.replace(/\s/g, '').toLowerCase()}">${workflow.status}</span>
                    </li>
                  `
                )
                .join('')}
            </ul>
          </div>
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Billing Summary</h3>
              <span class="pill pill--subtle">Next invoice · ${systemSettings.billing.nextInvoice}</span>
            </header>
            <div class="billing-card">
              <p class="billing-card__plan">${systemSettings.billing.plan} Plan</p>
              <p class="billing-card__usage">${systemSettings.billing.seatsUsed} of ${systemSettings.billing.seatsTotal} seats</p>
              <div class="billing-card__meter"><span style="width: ${usage}%"></span></div>
              <p class="billing-card__addons">Add-ons: ${systemSettings.billing.addOns.join(', ')}</p>
              <button class="workspace__button workspace__button--primary workspace__button--sm">Manage Subscription</button>
            </div>
          </div>
        </div>
      </section>

      <section class="panel panel--stack">
        <header class="panel__header">
          <div>
            <h2>Platform Activity</h2>
            <p>Latest administrative actions across the tenant.</p>
          </div>
        </header>
        <div class="panel__content panel__content--stacked">
          <ul class="timeline">
            ${[
              { action: 'Role updated', actor: 'Sofia Almeida', detail: 'Granted Finance Admin', time: '2h ago' },
              { action: 'Workflow published', actor: 'Mila Jensen', detail: 'Payroll exception playbook', time: '5h ago' },
              { action: 'New integration', actor: 'Lucas Martin', detail: 'Connected analytics warehouse', time: '1d ago' }
            ]
              .map(
                (entry) => `
                  <li class="timeline__item">
                    <div class="timeline__dot"></div>
                    <div>
                      <p class="timeline__action">${entry.action}</p>
                      <p class="timeline__detail">${entry.actor} · ${entry.detail}</p>
                      <p class="timeline__time">${entry.time}</p>
                    </div>
                  </li>
                `
              )
              .join('')}
          </ul>
          <div class="panel panel--nested">
            <header class="panel__subheader">
              <h3>Data Residency</h3>
              <span class="pill pill--subtle">EU Central</span>
            </header>
            <p class="panel__description">
              NovaHR is configured to store and process employee data in Frankfurt with real-time failover to Dublin.
            </p>
            <button class="workspace__button workspace__button--ghost workspace__button--sm">Change Region</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function initSettingsView() {
  document.querySelectorAll('[data-toggle-setting]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-active');
      const status = toggle.querySelector('.toggle__status');
      const isActive = toggle.classList.contains('is-active');
      status.textContent = isActive ? 'Enabled' : 'Disabled';
    });
  });
}
