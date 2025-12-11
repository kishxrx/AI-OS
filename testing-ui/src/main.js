import React, { useCallback, useEffect, useMemo, useState } from 'https://esm.sh/react@18.3.1?target=es2022';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client?target=es2022';
import htm from 'https://esm.sh/htm@3.1.0?bundle';
import {
  Activity,
  BellRing,
  Building2,
  BrainCircuit,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  UserCog,
} from 'https://esm.sh/lucide-react@0.259.0?bundle';

const html = htm.bind(React.createElement);

const PROPERTY_API_BASE_URL = window.PROPERTY_API_BASE_URL || 'http://localhost:3000/api';
const MASTER_AI_BASE_URL = window.MASTER_AI_BASE_URL || 'http://localhost:4000/api';

const initialProperties = [
  {
    id: 'prop-sunrise',
    name: 'Sunrise Residency',
    type: 'Apartment',
    status: 'ACTIVE',
    address: {
      addressLine1: 'MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
    },
    statistics: { unitCount: 18, floorCount: 4 },
    units: [
      { id: 'SUN-APT-BED-001', type: 'Bed', status: 'Occupied' },
      { id: 'SUN-APT-BED-002', type: 'Bed', status: 'Occupied' },
      { id: 'SUN-APT-FLR-001', type: 'Floor', status: 'Available' },
    ],
  },
  {
    id: 'prop-lakeview',
    name: 'Lakeview Towers',
    type: 'Apartment',
    status: 'ACTIVE',
    address: {
      addressLine1: 'Lakeview Road',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      pincode: '500048',
    },
    statistics: { unitCount: 20, floorCount: 5 },
    units: [
      { id: 'LAK-APT-FLR-001', type: 'Floor', status: 'Occupied' },
      { id: 'LAK-APT-FLR-002', type: 'Floor', status: 'Occupied' },
      { id: 'LAK-APT-BED-011', type: 'Bed', status: 'Occupied' },
    ],
  },
  {
    id: 'prop-cedar',
    name: 'Cedar Co-Living',
    type: 'PG',
    status: 'ACTIVE',
    address: {
      addressLine1: 'Jalahalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560013',
    },
    statistics: { unitCount: 12, floorCount: 3 },
    units: [
      { id: 'CED-PG-BED-001', type: 'Bed', status: 'Available' },
      { id: 'CED-PG-BED-002', type: 'Bed', status: 'Occupied' },
      { id: 'CED-PG-ROOM-001', type: 'Room', status: 'Occupied' },
    ],
  },
];

const serviceActions = {
  'master-ai': [
    {
      label: 'Master AI Console',
      value: 'console',
      icon: BrainCircuit,
      description: 'Inspect policy status, Pub/Sub health, and reasoning history.',
    },
    {
      label: 'Master AI Agent',
      value: 'agent',
      icon: Sparkles,
      description: 'Fire a reasoning prompt or inspect the latest snapshot.',
    },
  ],
  'property-ai': [
    {
      label: 'Create Property',
      value: 'create',
      icon: Building2,
      description: 'Onboard a new building with governance metadata.',
    },
    {
      label: 'Manage Properties',
      value: 'manage',
      icon: ClipboardList,
      description: 'See the portfolio, edit metadata, inspect units.',
    },
    {
      label: 'Property AI Agent',
      value: 'agent',
      icon: Sparkles,
      description: 'Ask Property AI to reason about maintenance or units.',
    },
  ],
};

const statusPalette = {
  healthy: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  degraded: 'bg-rose-100 text-rose-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  LOGICALLY_DELETED: 'bg-amber-100 text-amber-700',
  INACTIVE: 'bg-rose-100 text-rose-700',
};

const initialForm = {
  name: '',
  type: 'Apartment',
  address: { pincode: '', city: '', addressLine1: '', addressLine2: '', state: 'Karnataka', country: 'India' },
  status: 'ACTIVE',
};

const unitTypeMap = {
  Flats: 'FLAT',
  Beds: 'BED',
  Rooms: 'ROOM',
  Floors: 'FLOOR',
};

const fetchJson = async (input, init = {}) => {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    ...init,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return null;
  }
  const payload = await response.text();
  if (!payload) {
    return null;
  }
  return JSON.parse(payload);
};

const ServiceActionButton = ({ action, isActive, onClick }) => html`
  <button
    onClick=${() => onClick(action.value)}
    class=${`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
      isActive ? 'border-slate-900 bg-slate-900/10 text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
    }`}
  >
    <${action.icon} size="18" class="text-slate-500" />
    <div class="flex-1">
      <p class="font-semibold">${action.label}</p>
      <p class="text-xs text-slate-500">${action.description}</p>
    </div>
  </button>
`;

const DeleteModal = ({ open, title, description, onClose, onConfirm, disableConfirm, children }) =>
  open
    ? html`
        <div class="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/60">
          <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">${description}</p>
                <h3 class="text-xl font-semibold text-slate-900">${title}</h3>
              </div>
              <button onClick=${onClose} class="text-slate-400">✕</button>
            </div>
            <div class="mt-4 space-y-3 text-sm text-slate-600">${children}</div>
            <div class="mt-6 flex justify-end gap-2">
              <button onClick=${onClose} class="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
                Cancel
              </button>
              <button
                onClick=${onConfirm}
                class="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                disabled=${disableConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      `
    : null;

const App = () => {
  const [properties, setProperties] = useState(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState(initialProperties[0] ?? null);
  const [selectedUnits, setSelectedUnits] = useState(initialProperties[0]?.units ?? []);
  const [formState, setFormState] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [activeService, setActiveService] = useState('property-ai');
  const [activeAction, setActiveAction] = useState(serviceActions['property-ai'][0].value);
  const [detailTab, setDetailTab] = useState('units');
  const [deleteModal, setDeleteModal] = useState({ logical: false, hard: false });
  const [hardPhrase, setHardPhrase] = useState('');
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState('Summarize the latest property compliance tickets.');
  const [masterAgentPrompt, setMasterAgentPrompt] = useState('What is the next MCP task for Property AI?');
  const [propertyAgentAction, setPropertyAgentAction] = useState('summary');
  const [propertyAgentPropertyId, setPropertyAgentPropertyId] = useState('');
  const [propertyAgentConfirmHardDelete, setPropertyAgentConfirmHardDelete] = useState(false);
  const [propertyAgentResponse, setPropertyAgentResponse] = useState(null);
  const [masterAgentResponse, setMasterAgentResponse] = useState(null);
  const [masterHistory, setMasterHistory] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingMasterHistory, setLoadingMasterHistory] = useState(false);
  const [lastCreatedProperty, setLastCreatedProperty] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const propertyMetrics = useMemo(() => {
    const totalRental = properties.reduce((sum, property) => {
      const occupied = property.statistics?.unitCount ?? 0;
      return sum + occupied * 1200;
    }, 0);
    const collected = Math.round(totalRental * 0.92);
    const overdue = totalRental - collected;
    return [
      { label: 'Total Rental Income', value: `₹ ${totalRental.toLocaleString('en-IN')}`, delta: '₹ 12.3L MTD' },
      { label: 'Rent Collected', value: `₹ ${collected.toLocaleString('en-IN')}`, delta: '98% collected' },
      { label: 'Overdue Payments', value: `₹ ${overdue.toLocaleString('en-IN')}`, delta: '2 properties flagged' },
    ];
  }, [properties]);

  const fetchProperties = useCallback(async () => {
    setLoadingProperties(true);
    try {
      const data = await fetchJson(`${PROPERTY_API_BASE_URL}/properties`);
      if (Array.isArray(data)) {
        setProperties(data);
        setSelectedProperty((current) => {
          if (data.length === 0) {
            return null;
          }
          const existing = data.find((item) => item.id === current?.id);
          return existing ?? data[0];
        });
      }
      setStatusMessage('Properties synced from live service.');
    } catch (error) {
      setStatusMessage(`Unable to load properties: ${error.message}`);
      setProperties(initialProperties);
      setSelectedProperty((prev) => prev ?? initialProperties[0] ?? null);
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  const fetchUnitsForProperty = useCallback(async (propertyId) => {
    if (!propertyId) {
      setSelectedUnits([]);
      return;
    }
    setLoadingUnits(true);
    try {
      const data = await fetchJson(`${PROPERTY_API_BASE_URL}/properties/${propertyId}/units`);
      setSelectedUnits(Array.isArray(data) ? data : []);
      setStatusMessage('Units refreshed.');
    } catch (error) {
      setStatusMessage(`Unable to load units: ${error.message}`);
      setSelectedUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  const fetchMasterHistory = useCallback(async () => {
    setLoadingMasterHistory(true);
    try {
      const history = await fetchJson(`${MASTER_AI_BASE_URL}/master-ai/history`);
      setMasterHistory(Array.isArray(history) ? history : []);
    } catch (error) {
      setMasterHistory([]);
      setStatusMessage(`Master history unavailable: ${error.message}`);
    } finally {
      setLoadingMasterHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    if (selectedProperty?.id) {
      fetchUnitsForProperty(selectedProperty.id);
    } else {
      setSelectedUnits([]);
    }
    setUnitMenuOpen(false);
  }, [selectedProperty?.id, fetchUnitsForProperty]);

  useEffect(() => {
    if (activeService === 'master-ai') {
      fetchMasterHistory();
    }
  }, [activeService, fetchMasterHistory]);

  const handlePropertySubmit = async (event) => {
    event.preventDefault();
    if (working) {
      return;
    }
    setWorking(true);
    setStatusMessage('Saving property...');
    try {
      const payload = {
        name: formState.name,
        type: formState.type,
        address: formState.address,
        status: formState.status,
        ownerId: 'ceo-ui-dashboard',
      };
      const created = await fetchJson(`${PROPERTY_API_BASE_URL}/properties`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setLastCreatedProperty(created);
      setSuccessModalOpen(true);
      setStatusMessage(`Property "${created?.name ?? 'new property'}" created.`);
      await fetchProperties();
      setActiveService('property-ai');
      setActiveAction('manage');
    } catch (error) {
      setStatusMessage(`Create failed: ${error.message}`);
    } finally {
      setWorking(false);
      setFormState(initialForm);
    }
  };

  const selectService = (service) => {
    setActiveService(service);
    const nextAction = serviceActions[service]?.[0]?.value ?? 'console';
    setActiveAction(nextAction);
  };

  const handleUnitAdd = async (typeLabel) => {
    if (!selectedProperty) {
      return;
    }
    const unitType = unitTypeMap[typeLabel];
    if (!unitType) {
      return;
    }
    setUnitMenuOpen(false);
    setStatusMessage(`Adding ${typeLabel}...`);
    try {
      const generatedId = `${selectedProperty.name.slice(0, 3).toUpperCase()}-${unitType.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
      await fetchJson(`${PROPERTY_API_BASE_URL}/properties/${selectedProperty.id}/units`, {
        method: 'POST',
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          unitType,
          unitIdentifier: generatedId,
        }),
      });
      setStatusMessage(`${typeLabel} ${generatedId} created.`);
      await fetchUnitsForProperty(selectedProperty.id);
    } catch (error) {
      setStatusMessage(`Unit creation failed: ${error.message}`);
    }
  };

  const handleLogicalDelete = async () => {
    if (!selectedProperty) {
      return;
    }
    setStatusMessage('Running logical delete checks...');
    try {
      await fetchJson(`${PROPERTY_API_BASE_URL}/properties/${selectedProperty.id}/logical-delete`, {
        method: 'PATCH',
      });
      setStatusMessage(`Property "${selectedProperty.name}" marked as logically deleted.`);
      await fetchProperties();
    } catch (error) {
      setStatusMessage(`Logical delete failed: ${error.message}`);
    } finally {
      setDeleteModal((prev) => ({ ...prev, logical: false }));
    }
  };

  const handleHardDelete = async () => {
    if (!selectedProperty) {
      return;
    }
    setStatusMessage('Hard deleting property...');
    try {
      await fetchJson(`${PROPERTY_API_BASE_URL}/properties/${selectedProperty.id}`, {
        method: 'DELETE',
      });
      setStatusMessage(`Property "${selectedProperty.name}" permanently removed.`);
      await fetchProperties();
      setSelectedProperty(null);
    } catch (error) {
      setStatusMessage(`Hard delete failed: ${error.message}`);
    } finally {
      setHardPhrase('');
      setDeleteModal((prev) => ({ ...prev, hard: false }));
    }
  };

  const sendPropertyAgentPrompt = async () => {
    setStatusMessage('Sending request to Property AI agent...');
    try {
      const payload = {
        action: propertyAgentAction,
        propertyId: propertyAgentPropertyId || undefined,
        payload: {
          notes: agentPrompt,
          confirmHardDelete: propertyAgentConfirmHardDelete,
        },
      };
      const response = await fetchJson(`${PROPERTY_API_BASE_URL}/agent/property`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setPropertyAgentResponse(response);
      setStatusMessage('Property AI agent provided a response.');
    } catch (error) {
      setStatusMessage(`Property AI agent failed: ${error.message}`);
    }
  };

  const sendMasterAiPrompt = async () => {
    if (!masterAgentPrompt.trim()) {
      return;
    }
    setStatusMessage('Sending reasoning request to Master AI...');
    try {
      const payload = {
        eventId: `ui-${Date.now()}`,
        action: 'create_property',
        propertyId: selectedProperty?.id ?? 'ui-demo',
        user: {
          id: 'ceo-ui',
          role: 'ceo',
          permissions: ['property:create'],
        },
        payload: { prompt: masterAgentPrompt },
      };
      const response = await fetchJson(`${MASTER_AI_BASE_URL}/master-ai/events`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMasterAgentResponse(response.brief);
      setStatusMessage('Master AI reasoning brief received.');
      await fetchMasterHistory();
    } catch (error) {
      setStatusMessage(`Master AI agent failed: ${error.message}`);
    }
  };

  const renderPropertyCard = (property) => {
    const occupancy = property.statistics?.unitCount ?? property.units?.length ?? 0;
    const capacity = 20;
    const isSelected = selectedProperty?.id === property.id;
    return html`
      <div
        key=${property.id}
        class=${`rounded-3xl border p-4 shadow-sm transition ${
          isSelected ? 'border-slate-900 bg-slate-900/5' : 'border-slate-200 bg-white'
        }`}
      >
        <div class="flex h-40 flex-col justify-end rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900/60 p-4 text-white">
          <p class="text-[10px] uppercase tracking-[0.5em] text-slate-200">${property.type}</p>
          <p class="text-lg font-semibold">${property.name}</p>
        </div>
        <div class="mt-3 space-y-2 text-sm text-slate-600">
          <p>${property.address.addressLine1}</p>
          <p>${property.address.city}, ${property.address.state}</p>
        </div>
        <div class="mt-3 flex items-center justify-between text-xs font-semibold">
          <span class=${statusPalette[property.status] ?? 'bg-slate-100 text-slate-600'}>
            ${occupancy >= capacity ? 'FULL' : `${occupancy}/${capacity}`}
          </span>
          <span class="text-slate-500">${property.status === 'ACTIVE' ? 'Active' : 'Paused'}</span>
        </div>
        <div class="mt-3 flex items-center justify-between">
          <button
            onClick=${() => setSelectedProperty(property)}
            class="rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800"
          >
            Details
          </button>
          <button
            onClick=${() => {
              setSelectedProperty(property);
              setDetailTab('units');
            }}
            class="rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
          >
            Manage units
          </button>
        </div>
      </div>
    `;
  };

  const renderServiceActions = () => {
    if (!activeService) {
      return html`<p class="text-xs text-slate-400">Select a service to unlock consoles and agents.</p>`;
    }
    return html`
      <div class="space-y-2">
        ${serviceActions[activeService]?.map((action) =>
          html`<${ServiceActionButton} key=${action.value} action=${action} isActive=${activeAction === action.value} onClick=${setActiveAction} />`,
        )}
      </div>
    `;
  };

  const renderServicePanel = () => {
    if (!activeService) {
      return html`
        <div class="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500">
          Choose Master AI or Property AI to see their consoles, agents, and controls.
        </div>
      `;
    }

    const isPropertyService = activeService === 'property-ai';

    if (isPropertyService && activeAction === 'create') {
      return html`
        <form class="space-y-4 text-sm" onSubmit=${handlePropertySubmit}>
          <div>
            <label class="text-xs font-semibold uppercase text-slate-500">Property name</label>
            <input
              value=${formState.name}
              onInput=${(event) => setFormState((prev) => ({ ...prev, name: event.currentTarget.value }))}
              placeholder="ABC"
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="text-xs font-semibold uppercase text-slate-500">Type</label>
            <select
              value=${formState.type}
              onChange=${(event) => setFormState((prev) => ({ ...prev, type: event.currentTarget.value }))}
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="Apartment">Apartment</option>
              <option value="PG">PG</option>
              <option value="House">House</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <input
              value=${formState.address.pincode}
              onInput=${(event) => setFormState((prev) => ({
                ...prev,
                address: { ...prev.address, pincode: event.currentTarget.value },
              }))}
              placeholder="Pincode"
              class="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              required
            />
            <input
              value=${formState.address.city}
              onInput=${(event) => setFormState((prev) => ({
                ...prev,
                address: { ...prev.address, city: event.currentTarget.value },
              }))}
              placeholder="City"
              class="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              required
            />
          </div>
          <input
            value=${formState.address.addressLine1}
            onInput=${(event) => setFormState((prev) => ({
              ...prev,
              address: { ...prev.address, addressLine1: event.currentTarget.value },
            }))}
            placeholder="Address Line 1"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            required
          />
          <input
            value=${formState.address.addressLine2}
            onInput=${(event) => setFormState((prev) => ({
              ...prev,
              address: { ...prev.address, addressLine2: event.currentTarget.value },
            }))}
            placeholder="Address Line 2"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
            <p class="font-semibold text-slate-900">Add pictures</p>
            <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400">Drop images</p>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase text-slate-500">Status</label>
            <select
              value=${formState.status}
              onChange=${(event) => setFormState((prev) => ({ ...prev, status: event.currentTarget.value }))}
              class="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="LOGICALLY_DELETED">L.Delete</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              onClick=${() => setFormState(initialForm)}
              class="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled=${working}
              class="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </form>
      `;
    }

    if (isPropertyService && activeAction === 'manage') {
      return html`
        <div class="space-y-3 text-sm">
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Portfolio snapshot</p>
          ${properties.map(
            (property) => html`
              <div class="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700">
                <div>
                  <p class="font-semibold">${property.name}</p>
                  <p class="text-xs text-slate-500">${property.type} • ${property.address.city}</p>
                </div>
                <button
                  onClick=${() => {
                    setSelectedProperty(property);
                    setDetailTab('overview');
                  }}
                  class="rounded-2xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  Edit
                </button>
              </div>
            `,
          )}
        </div>
      `;
    }

    if (isPropertyService && activeAction === 'agent') {
      return html`
        <div class="space-y-3 text-sm">
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Property AI Agent</p>
          <div class="grid gap-2 md:grid-cols-3">
            <label class="text-[10px] uppercase tracking-[0.3em] text-slate-500">Action</label>
            <select
              value=${propertyAgentAction}
              onChange=${(event) => setPropertyAgentAction(event.currentTarget.value)}
              class="rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:border-slate-500"
            >
              <option value="summary">Portfolio summary</option>
              <option value="priority">Top priority</option>
              <option value="occupancy">Occupancy totals</option>
              <option value="logicalDelete">Logical delete</option>
              <option value="hardDelete">Hard delete</option>
            </select>
          </div>
          <input
            value=${propertyAgentPropertyId}
            onInput=${(event) => setPropertyAgentPropertyId(event.currentTarget.value)}
            placeholder="Property ID (optional)"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs focus:border-slate-500 focus:outline-none"
          />
          ${propertyAgentAction === 'hardDelete'
            ? html`
                <label class="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked=${propertyAgentConfirmHardDelete}
                    onChange=${(event) => setPropertyAgentConfirmHardDelete(event.currentTarget.checked)}
                  />
                  Confirm hard delete
                </label>
              `
            : null}
          <textarea
            value=${agentPrompt}
            onInput=${(event) => setAgentPrompt(event.currentTarget.value)}
            rows="4"
            placeholder="Add context for the assistant (optional)"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          ></textarea>
          <div class="flex justify-between text-xs text-slate-500">
            <span>Model: GPT-4.1 Nano</span>
            <span>Agent ready</span>
          </div>
          <button class="w-full rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white" onClick=${sendPropertyAgentPrompt}>
            Send prompt
          </button>
          ${propertyAgentResponse
            ? html`
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p class="text-[11px] font-semibold text-slate-900">
                    Status: ${propertyAgentResponse.success ? 'Success' : 'Pending'}
                  </p>
                  <p>${propertyAgentResponse.narrative}</p>
                  ${propertyAgentResponse.safety
                    ? html`<p class="text-[10px] text-slate-500">Safety: ${propertyAgentResponse.safety}</p>`
                    : null}
                  ${propertyAgentResponse.recommendations
                    ? html`
                        <ul class="mt-2 list-disc pl-4 text-[10px] text-slate-500">
                          ${propertyAgentResponse.recommendations.map(
                            (item) => html`<li>${item}</li>`,
                          )}
                        </ul>
                      `
                    : null}
                </div>
              `
            : null}
        </div>
      `;
    }

    if (activeService === 'master-ai' && activeAction === 'console') {
      return html`
        <div class="space-y-3 text-sm">
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Master AI Console</p>
          <p class="text-slate-600">Policy compliance is monitored live. Latest MCP task executed against Property AI.</p>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p>Pub/Sub topic: property-events</p>
            <p>LPM agent: ${masterHistory.length ? 'Responding' : 'Idle'}</p>
          </div>
          <div class="space-y-2 text-xs text-slate-500">
            ${loadingMasterHistory
              ? html`<p>Loading reasoning history...</p>`
              : masterHistory.length
                ? masterHistory.slice(0, 3).map(
                    (snapshot) => html`
                      <div class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <p class="font-semibold text-slate-900">${snapshot.action} → ${snapshot.decision}</p>
                        <p>${snapshot.details ?? 'No details provided.'}</p>
                        <p class="text-[10px] uppercase tracking-[0.4em] text-slate-400">${snapshot.timestamp ?? 'unknown'}</p>
                      </div>
                    `,
                  )
                : html`<p>No reasoning snapshots captured yet.</p>`}
          </div>
        </div>
      `;
    }

    if (activeService === 'master-ai' && activeAction === 'agent') {
      return html`
        <div class="space-y-3 text-sm">
          <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Master AI Agent</p>
          <textarea
            value=${masterAgentPrompt}
            onInput=${(event) => setMasterAgentPrompt(event.currentTarget.value)}
            rows="4"
            class="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          ></textarea>
          <div class="flex justify-between text-xs text-slate-500">
            <span>Model: GPT-4.1 Nano</span>
            <span>Plan builder engaged</span>
          </div>
          <button class="w-full rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white" onClick=${sendMasterAiPrompt}>
            Send prompt
          </button>
          ${masterAgentResponse
            ? html`
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p class="font-semibold text-slate-900">Narrative</p>
                  <p>${masterAgentResponse.narrative}</p>
                  <p class="text-[10px] text-slate-500">Safety summary: ${masterAgentResponse.safety}</p>
                  ${masterAgentResponse.recommendations?.length
                    ? html`
                        <ul class="mt-2 list-disc pl-4 text-[10px] text-slate-500">
                          ${masterAgentResponse.recommendations.map(
                            (reason) => html`<li>${reason}</li>`,
                          )}
                        </ul>
                      `
                    : null}
                  <div class="mt-2 text-[10px] text-slate-500">
                    Portfolio: ${masterAgentResponse.metrics.totalProperties} properties, ${masterAgentResponse.metrics.totalUnits} units
                    ${masterAgentResponse.metrics.priority
                      ? html` • Priority: ${masterAgentResponse.metrics.priority.name} (${masterAgentResponse.metrics.priority.reason})`
                      : ''}
                  </div>
                </div>
              `
            : null}
        </div>
      `;
    }

    return html`
      <p class="text-sm text-slate-500">This view will show the selected service actions.</p>
    `;
  };

  return html`
    <div class="min-h-screen bg-slate-50">
      <div class="flex">
        <aside class="w-72 border-r border-slate-200 bg-white px-6 py-8">
          <div class="mb-10">
            <p class="text-lg font-semibold text-slate-900">Property Management</p>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-500">CEO / Admin View</p>
          </div>
          <div class="space-y-3">
            <button
              onClick=${() => selectService(null)}
              class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <${Home} size="18" class="text-slate-500" />
              Dashboard overview
            </button>
            <button
              onClick=${() => selectService('master-ai')}
              class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <${BrainCircuit} size="18" class="text-slate-500" />
              Master AI
            </button>
            <button
              onClick=${() => selectService('property-ai')}
              class="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <${Building2} size="18" class="text-slate-500" />
              Property AI
            </button>
          </div>
          <div class="mt-10 space-y-3 text-xs text-slate-400">
            <p>Deployed services</p>
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
              <span>Master AI</span>
              <span class="text-[10px] text-emerald-500">Live</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
              <span>Property AI</span>
              <span class="text-[10px] text-emerald-500">Live</span>
            </div>
          </div>
          <div class="mt-auto flex items-center gap-3 pt-10 text-sm">
            <${ShieldCheck} size="18" class="text-slate-500" />
            <p class="text-slate-500">Secure controls</p>
          </div>
          <div class="mt-6 flex items-center gap-3 text-sm text-slate-500">
            <${UserCog} size="18" />
            Settings
          </div>
          <div class="mt-3 flex items-center gap-3 text-sm text-slate-500">
            <${LogOut} size="18" />
            Logout
          </div>
        </aside>
        <main class="flex-1 space-y-6 p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
              <h1 class="text-2xl font-semibold text-slate-900">CEO Command Center</h1>
            </div>
            <div class="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-xl">
              <input
                type="search"
                placeholder="Search ministry, agent..."
                class="flex-1 border-0 bg-transparent text-sm focus:outline-none"
              />
              <${BellRing} size="20" class="text-slate-500" />
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            ${propertyMetrics.map(
              (metric) => html`
                <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p class="text-xs uppercase tracking-[0.4em] text-slate-400">${metric.label}</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">${metric.value}</p>
                  <p class="text-xs text-slate-500">${metric.delta}</p>
                </div>
              `,
            )}
          </div>
          <div class="grid gap-4 lg:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-sm font-semibold text-slate-900">Recent Activity</p>
              <ul class="mt-3 space-y-3 text-sm text-slate-600">
                <li class="flex items-start gap-2">
                  <${Activity} size="14" class="text-slate-500" />
                  New tenant added at Sunrise Residency (5 min ago)
                </li>
                <li class="flex items-start gap-2">
                  <${Activity} size="14" class="text-slate-500" />
                  Rent collected for Bed 123 (15 min ago)
                </li>
                <li class="flex items-start gap-2">
                  <${Activity} size="14" class="text-slate-500" />
                  Cabinet Secretary AI flagged compliance breach (22 min ago)
                </li>
              </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-sm font-semibold text-slate-900">Alerts & Compliance</p>
              <ul class="mt-3 space-y-3 text-sm text-slate-600">
                <li class="rounded-2xl bg-rose-50 p-3 text-rose-600">Maintenance backlog (Sunrise Residency)</li>
                <li class="rounded-2xl bg-amber-50 p-3 text-amber-700">Unauthorized data access attempt blocked</li>
                <li class="rounded-2xl bg-emerald-50 p-3 text-emerald-700">Pending approvals: 3 dispute cases</li>
              </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-sm font-semibold text-slate-900">Audit Summary</p>
              <div class="mt-3 space-y-3 text-sm text-slate-600">
                <p>Policy Compliance: 99.3%</p>
                <p>Pending human reviews: 3 cases</p>
                <p>Discrepancies found: 2 (awaiting investigation)</p>
                <p>Master AI template hit rate: 88%</p>
              </div>
            </div>
          </div>
          <section class="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">Properties</h3>
                  <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Portfolio</p>
                </div>
                <button
                  onClick=${() => {
                    setActiveService('property-ai');
                    setActiveAction('create');
                  }}
                  class="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Add Property
                </button>
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                ${properties.map((property) => renderPropertyCard(property))}
              </div>
              ${selectedProperty
                ? html`
                    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Property</p>
                          <h3 class="text-xl font-semibold text-slate-900">${selectedProperty.name}</h3>
                          <p class="text-xs text-slate-500">${selectedProperty.address.city} • ${selectedProperty.type}</p>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                          <button
                            onClick=${() => setDetailTab('overview')}
                            class=${`rounded-full px-3 py-1 ${detailTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                          >
                            Overview
                          </button>
                          <button
                            onClick=${() => setDetailTab('units')}
                            class=${`rounded-full px-3 py-1 ${detailTab === 'units' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                          >
                            Units
                          </button>
                        </div>
                      </div>
                      ${detailTab === 'overview'
                        ? html`
                            <div class="mt-5 grid gap-4 md:grid-cols-2">
                              <div>
                                <p class="text-xs text-slate-500">Occupancy</p>
                                <p class="text-lg font-semibold text-slate-900">${selectedProperty.statistics?.unitCount ?? selectedUnits.length}/20</p>
                              </div>
                              <div>
                                <p class="text-xs text-slate-500">Status</p>
                                <p class="text-sm font-semibold text-slate-900">${selectedProperty.status}</p>
                              </div>
                              <div>
                                <p class="text-xs text-slate-500">Policy checks</p>
                                <p class="text-sm text-emerald-600">Clear</p>
                              </div>
                              <div>
                                <p class="text-xs text-slate-500">Audit backlog</p>
                                <p class="text-sm text-amber-600">2 tickets</p>
                              </div>
                            </div>
                          `
                        : html`
                            <div class="mt-5 space-y-3">
                              ${loadingUnits
                                ? html`<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500">Loading units...</div>`
                                : selectedUnits.length
                                  ? selectedUnits.map(
                                      (unit) => html`
                                        <div class="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
                                          <div>
                                            <p class="font-semibold">${unit.unitIdentifier ?? unit.id}</p>
                                            <p class="text-xs text-slate-500">${unit.unitType} • ${unit.status}</p>
                                          </div>
                                          <button class="text-xs text-slate-500">Edit</button>
                                        </div>
                                      `,
                                    )
                                  : html`<p class="text-xs text-slate-500">No units registered yet.</p>`}
                              <div class="relative">
                                <button
                                  onClick=${() => setUnitMenuOpen((prev) => !prev)}
                                  class="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                                >
                                  Add Units ^
                                </button>
                                ${unitMenuOpen
                                  ? html`
                                      <div class="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white text-sm shadow-lg">
                                        ${Object.keys(unitTypeMap).map(
                                          (typeLabel) => html`
                                            <button
                                              onClick=${() => handleUnitAdd(typeLabel)}
                                              class="w-full rounded-2xl px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
                                            >
                                              + ${typeLabel}
                                            </button>
                                          `,
                                        )}
                                      </div>
                                    `
                                  : null}
                              </div>
                            </div>
                          `}
                      <div class="mt-5 flex flex-wrap gap-3 text-xs">
                        <button
                          onClick=${() => setDeleteModal((prev) => ({ ...prev, logical: true }))}
                          class="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700"
                        >
                          Logical delete
                        </button>
                        <button
                          onClick=${() => setDeleteModal((prev) => ({ ...prev, hard: true }))}
                          class="rounded-2xl border border-rose-400 px-4 py-2 text-rose-600"
                        >
                          Hard delete
                        </button>
                      </div>
                    </div>
                  `
                : null}
            </div>
            <div class="space-y-4">
              <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Service console</p>
                    <h3 class="text-lg font-semibold text-slate-900">
                      ${activeService ? `${activeService === 'property-ai' ? 'Property AI' : 'Master AI'}` : 'No service selected'}
                    </h3>
                  </div>
                  <${Menu} size="18" class="text-slate-400" />
                </div>
                <div class="mt-4 space-y-3">${renderServiceActions()}</div>
              </div>
              <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                ${renderServicePanel()}
              </div>
            </div>
          </section>
          ${statusMessage
            ? html`
                <div class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  ${statusMessage}
                </div>
              `
            : null}
        </main>
      </div>
      ${successModalOpen && lastCreatedProperty
        ? html`
            <div class="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/60">
              <div class="mx-4 w-full max-w-lg rounded-3xl border border-emerald-200 bg-white p-6 shadow-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.4em] text-slate-500">Success</p>
                    <h3 class="text-xl font-semibold text-slate-900">Property added successfully</h3>
                  </div>
                  <button onClick=${() => setSuccessModalOpen(false)} class="text-slate-400">✕</button>
                </div>
                <p class="mt-4 text-sm text-slate-600">
                  Added ${lastCreatedProperty.name} (${lastCreatedProperty.type}) in ${lastCreatedProperty.address.city}.
                </p>
                <p class="text-sm text-slate-600">Occupancy will reflect current unit uploads.</p>
                <div class="mt-5 flex justify-end gap-2 text-xs">
                  <button
                    onClick=${() => setSuccessModalOpen(false)}
                    class="rounded-2xl border border-slate-200 px-4 py-2 text-slate-700"
                  >
                    Close
                  </button>
                  <button
                    onClick=${() => {
                      setDetailTab('units');
                      setSuccessModalOpen(false);
                    }}
                    class="rounded-2xl bg-slate-900 px-4 py-2 text-white"
                  >
                    Add units
                  </button>
                </div>
              </div>
            </div>
          `
        : null}
      ${DeleteModal({
        open: deleteModal.logical,
        title: 'Logical Delete',
        description: 'Soft delete',
        onClose: () => setDeleteModal((prev) => ({ ...prev, logical: false })),
        onConfirm: handleLogicalDelete,
        children: html`
          <p>Logical delete hides the property and freezes data. Nothing is removed.</p>
          <ul class="list-disc pl-5 text-xs text-slate-600">
            <li>No active tenants (pending check)</li>
            <li>No outstanding balance (pending check)</li>
          </ul>
        `,
      })}
      ${DeleteModal({
        open: deleteModal.hard,
        title: 'Hard Delete',
        description: 'Permanent delete',
        onClose: () => setDeleteModal((prev) => ({ ...prev, hard: false })),
        onConfirm: handleHardDelete,
        disableConfirm: hardPhrase !== `DELETE ${selectedProperty?.name ?? ''}`,
        children: html`
          <p>This action permanently deletes the property. Type DELETE ${selectedProperty?.name ?? 'PROPERTY'} to confirm.</p>
          <input
            value=${hardPhrase}
            onInput=${(event) => setHardPhrase(event.currentTarget.value)}
            placeholder=${`DELETE ${selectedProperty?.name ?? ''}`}
            class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        `,
      })}
    </div>
  `;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
