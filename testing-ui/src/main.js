import React, { useState, useEffect, useMemo } from 'https://esm.sh/react@18.3.1?target=es2022';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client?target=es2022';
import {
  BellRing,
  Building2,
  ShieldCheck,
  Activity,
  ClipboardList,
  PenSquare,
  ShieldOff,
  CheckCircle2,
  LogOut,
  Menu,
  Sparkles,
  Home,
  UserCog,
  Layers2,
  BrainCircuit,
  X,
  AlertTriangle,
} from 'https://esm.sh/lucide-react@0.259.0?bundle';

const API_BASE = window.PROPERTY_API_BASE_URL || 'http://localhost:3000';

const statusPalette = {
  healthy: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  degraded: 'bg-rose-100 text-rose-700',
};

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

const Sidebar = () => {
  const navItems = [
    { label: 'Ministries', icon: Layers2 },
    { label: 'Finance', icon: ClipboardList },
    { label: 'Property & Tenant', icon: Home },
    { label: 'Welfare', icon: ShieldCheck },
    { label: 'Technology', icon: BrainCircuit },
    { label: 'Growth & Commerce', icon: PenSquare },
    { label: 'Judiciary / Policies', icon: ShieldOff },
    { label: 'AI Agents / Cabinet Secretary', icon: Sparkles },
  ];

  return (
    <aside className="w-72 border-r border-slate-200 bg-white px-6 py-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Property Management</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">CEO View</p>
        </div>
        <button className="rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
          <Menu size={18} />
        </button>
      </div>
      <nav className="space-y-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-10 space-y-3 border-t border-slate-200 pt-6">
        <button className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <UserCog size={16} /> Settings
        </button>
        <button className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

const DashboardHeader = () => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
      <h1 className="text-2xl font-semibold text-slate-900">CEO - Property & Cabinet Operations</h1>
    </div>
    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-xl">
      <input
        type="search"
        placeholder="Search ministry, agent..."
        className="flex-1 border-0 bg-transparent text-sm focus:outline-none"
      />
      <BellRing size={20} className="text-slate-500" />
    </div>
  </div>
);

const ServiceHealth = () => {
  const services = [
    {
      name: 'Property AI',
      status: 'healthy',
      detail: 'Serves property, unit, and lifecycle operations',
      icon: Building2,
    },
    {
      name: 'Master AI',
      status: 'healthy',
      detail: 'Oversees governance, policies, and MCP calls',
      icon: BrainCircuit,
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {services.map((service) => (
        <div key={service.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-50 p-2 text-slate-600">
              <service.icon size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{service.name}</p>
              <p className="text-xs text-slate-500">{service.detail}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPalette[service.status]}`}>
            {service.status === 'healthy' ? 'Ready' : 'Attention'}
          </span>
        </div>
      ))}
    </div>
  );
};

const KpiCard = ({ label, value, delta, icon: Icon }) => (
  <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {delta && <p className="text-sm text-emerald-500">{delta}</p>}
    </div>
    <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
      <Icon size={24} />
    </div>
  </div>
);

const PropertyCard = ({ property, isSelected, onSelect, units }) => {
  const occupancyCount = units?.length || 0;
  const capacity = property?.statistics?.unitCount || 20;
  const isFull = occupancyCount >= capacity;

  return (
    <div
      onClick={() => onSelect(property)}
      className={`flex cursor-pointer flex-col justify-between gap-3 rounded-2xl border px-4 py-4 shadow-sm transition hover:border-slate-400 ${
        isSelected ? 'border-slate-900 bg-slate-900/5' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900/60 text-white shadow-inner">
        <div className="flex h-full flex-col justify-end p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Property</p>
          <p className="text-lg font-bold">{property.name}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{property.address?.addressLine1}</p>
        <p className="text-xs text-slate-500">{`${property.address?.city}, ${property.address?.country}`}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={`rounded-full px-3 py-1 font-semibold ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {isFull ? 'FULL' : `${occupancyCount}/${capacity}`}
        </span>
        <span className="text-xs text-slate-500">{isFull ? 'Fully occupied' : 'Accepting tenants'}</span>
      </div>
    </div>
  );
};

const DuplicateCheckPanel = ({ onRunCheck, lastResult }) => {
  const [query, setQuery] = useState('');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">Duplicate Name Check</p>
        <AlertTriangle size={16} className="text-slate-500" />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Ensure the property name is unique before onboarding. This runs the same check as Property AI.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type property name"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          onClick={() => onRunCheck(query)}
          disabled={!query}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Run Duplicate Check
        </button>
        {lastResult && (
          <p className={`text-sm ${lastResult.cleared ? 'text-emerald-600' : 'text-rose-600'}`}>{lastResult.details}</p>
        )}
      </div>
    </div>
  );
};

const PropertyDetails = ({
  property,
  units,
  onAddUnit,
  onLogicalDelete,
  onHardDelete,
}) => {
  const [tab, setTab] = useState('units');
  const occupancyCount = units?.length || 0;
  const capacity = property?.statistics?.unitCount || 20;
  const isFull = occupancyCount >= capacity;

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{`Property ${property.name}`}</h2>
          <p className="text-xs text-slate-500">Status: {property.status}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogicalDelete}
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800"
          >
            Logical Delete
          </button>
          <button
            onClick={onHardDelete}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800"
          >
            Hard Delete
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="rounded-2xl border border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
          {tab.toUpperCase()}
        </div>
        {['overview', 'units'].map((option) => (
          <button
            key={option}
            onClick={() => setTab(option)}
            className={`rounded-2xl px-3 py-1 text-xs font-semibold ${tab === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {tab === 'overview' ? (
          <div className="space-y-2 text-sm text-slate-600">
            <p>{property.address?.addressLine1}</p>
            <p>{`${property.address?.city}, ${property.address?.country}`}</p>
            <p>{`Occupancy: ${occupancyCount}/${capacity}`}</p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" /> Verified owner: {property.ownerId}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Units ({units.length})</p>
              <button
                onClick={onAddUnit}
                className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Add Units
                <ArrowCaret />
              </button>
            </div>
            {!units.length ? (
              <p className="text-sm text-slate-500">No units added yet.</p>
            ) : (
              <div className="space-y-2">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{unit.unitIdentifier}</p>
                      <p className="text-xs text-slate-500">{unit.unitType}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1">{unit.status}</span>
                      <button className="text-slate-500 hover:text-slate-900">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={`rounded-2xl border ${isFull ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'} px-3 py-3 text-xs font-semibold`}>
              {isFull ? 'Property at capacity' : 'Capacity available'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ArrowCaret = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.5 7.5 11h9z" />
  </svg>
);

const AddUnitsInput = ({ onCreate, onCancel }) => {
  const [type, setType] = useState('FLAT');
  const [identifier, setIdentifier] = useState('');
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Add unit</p>
        <button onClick={onCancel} className="text-xs text-slate-500">
          Cancel
        </button>
      </div>
      <div className="mt-3 space-y-3 text-sm">
        <div>
          <label className="text-xs font-semibold text-slate-500">Type</label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="FLAT">Flat</option>
            <option value="ROOM">Room</option>
            <option value="BED">Bed</option>
            <option value="FLOOR">Floor</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Identifier</label>
          <input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Prop-ABC-BED-001"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onCreate({ type, identifier, quantity })}
            className="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Create unit
          </button>
          <button onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-900">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ open, title, description, children, onConfirm, onClose, disableConfirm }) => {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60">
      <div className="w-11/12 max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
            <h3 className="text-lg font-semibold text-slate-900">{description}</h3>
          </div>
          <button onClick={onClose}>
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-900">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disableConfirm}
            className="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [showUnitsInput, setShowUnitsInput] = useState(false);
  const [deleteFlow, setDeleteFlow] = useState({ logical: false, hard: false });
  const [hardDeletePhrase, setHardDeletePhrase] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    type: 'Apartment',
    imageUrls: '',
    address: { pincode: '', city: '', addressLine1: '', addressLine2: '', country: 'India', state: 'Karnataka' },
    status: 'ACTIVE',
  });

  const loadProperties = async () => {
    try {
      const data = await fetchJson('/properties');
      setProperties(data);
    } catch (error) {
      setStatusMessage(`Unable to load properties: ${error.message}`);
    }
  };

  const loadUnits = async (propertyId) => {
    if (!propertyId) {
      setUnits([]);
      return;
    }
    try {
      const data = await fetchJson(`/properties/${propertyId}/units`);
      setUnits(data ?? []);
    } catch (error) {
      setStatusMessage(`Unable to load units: ${error.message}`);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (!selectedProperty && properties.length) {
      setSelectedProperty(properties[0]);
      return;
    }
    if (selectedProperty) {
      loadUnits(selectedProperty.id);
    }
  }, [properties, selectedProperty]);

  const handleCreateProperty = async (event) => {
    event.preventDefault();
    if (!formState.name || !formState.address.addressLine1) {
      setStatusMessage('Name and address are required.');
      return;
    }
    setWorking(true);
    try {
      const payload = {
        name: formState.name,
        type: formState.type,
        ownerId: 'ceo-admin',
        status: formState.status,
        imageUrls: formState.imageUrls ? formState.imageUrls.split(',').map((url) => url.trim()) : [],
        address: { ...formState.address },
        statistics: { unitCount: 20, floorCount: 5 },
      };
      const created = await fetchJson('/properties', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStatusMessage(`Property "${created.name}" created.`);
      await loadProperties();
      setSelectedProperty(created);
    } catch (error) {
      setStatusMessage(`Property creation failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  };

  const handleDuplicateCheck = async (name) => {
    if (!name) {
      setDuplicateResult(null);
      return;
    }
    try {
      const result = await fetchJson('/properties/duplicate-check', {
        method: 'POST',
        body: JSON.stringify({ payload: { property: { name } } }),
      });
      setDuplicateResult(result);
    } catch (error) {
      setDuplicateResult({ cleared: false, details: error.message });
    }
  };

  const handleAddUnit = () => {
    setShowUnitsInput(true);
  };

  const handleCreateUnit = async ({ type, identifier, quantity }) => {
    if (!selectedProperty) {
      setStatusMessage('Select a property before creating units.');
      return;
    }
    const payload = {
      propertyId: selectedProperty.id,
      unitType: type,
      unitIdentifier: identifier || `${selectedProperty.name}-${type}-${Math.floor(Math.random() * 1000)}`,
      status: 'AVAILABLE',
      quantity,
    };
    setWorking(true);
    try {
      await fetchJson(`/properties/${selectedProperty.id}/units`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStatusMessage('Unit added.');
      setShowUnitsInput(false);
      void loadUnits(selectedProperty.id);
    } catch (error) {
      setStatusMessage(`Unit creation failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  };

  const handleLogicalDelete = () => {
    if (!selectedProperty) {
      return;
    }
    setDeleteFlow((prev) => ({ ...prev, logical: true }));
  };

  const confirmLogicalDelete = async () => {
    if (!selectedProperty) {
      return;
    }
    setDeleteFlow((prev) => ({ ...prev, logical: false }));
    setWorking(true);
    try {
      await fetchJson(`/properties/${selectedProperty.id}/logical-delete`, {
        method: 'PATCH',
      });
      setStatusMessage('Property marked as logically deleted.');
      await loadProperties();
      setSelectedProperty(null);
    } catch (error) {
      setStatusMessage(`Logical delete failed: ${error.message}`);
    } finally {
      setWorking(false);
    }
  };

  const handleHardDelete = () => {
    setDeleteFlow((prev) => ({ ...prev, hard: true }));
  };

  const expectedHardDeletePhrase = useMemo(
    () => (selectedProperty ? `DELETE ${selectedProperty.name}` : ''),
    [selectedProperty],
  );

  const confirmHardDelete = async () => {
    if (!selectedProperty) {
      return;
    }
    setDeleteFlow((prev) => ({ ...prev, hard: false }));
    setWorking(true);
    try {
      await fetchJson(`/properties/${selectedProperty.id}`, { method: 'DELETE' });
      setStatusMessage('Property permanently deleted.');
      await loadProperties();
      setSelectedProperty(null);
      setHardDeletePhrase('');
    } catch (error) {
      setStatusMessage(`Hard delete failed: ${error.message}`);
      setHardDeletePhrase('');
    } finally {
      setWorking(false);
    }
  };

  const propertyMetrics = useMemo(() => {
    const rentalIncome = properties.reduce((sum, property) => sum + (property.statistics?.unitCount ?? 0) * 1500, 0);
    return [
      { label: 'Total Rental Income', value: `₹ ${rentalIncome.toLocaleString('en-IN')}`, icon: Activity, delta: '₹ 1.2L MTD' },
      { label: 'Rent Collected', value: `₹ ${(rentalIncome * 0.84).toLocaleString('en-IN')}`, icon: ShieldCheck, delta: '98% on-time' },
      { label: 'Overdue Payments', value: `₹ ${(rentalIncome * 0.12).toLocaleString('en-IN')}`, icon: AlertTriangle, delta: '12 overdue cases' },
    ];
  }, [properties]);

  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 space-y-6 p-6">
          <DashboardHeader />
          <ServiceHealth />
          <div className="grid gap-4 md:grid-cols-3">{propertyMetrics.map((metric) => <KpiCard key={metric.label} {...metric} />)}</div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Recent Activity</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Activity size={14} className="text-slate-500" />
                  New tenant added to Apt 4A (5 min ago)
                </li>
                <li className="flex items-start gap-2">
                  <Activity size={14} className="text-slate-500" />
                  Rent collected for Bed 123 (15 min ago)
                </li>
                <li className="flex items-start gap-2">
                  <Activity size={14} className="text-slate-500" />
                  Cabinet Secretary AI noted compliance breach (22 min ago)
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Alerts & Compliance</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="rounded-2xl bg-rose-50 p-3 text-rose-600">Maintenance backlog (Property Sunset Lofts)</li>
                <li className="rounded-2xl bg-amber-50 p-3 text-amber-700">Unauthorized data access attempt blocked</li>
                <li className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">Pending approvals: 3 dispute cases</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Audit Summary</p>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>Policy Compliance: 99.3%</p>
                <p>Pending human reviews: 3 cases</p>
                <p>Discrepancies found: 2 (awaiting investigation)</p>
                <p>Master AI template hit rate: 88%</p>
              </div>
            </div>
          </div>
          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Properties</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Portfolio</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    units={property.id === selectedProperty?.id ? units : []}
                    isSelected={selectedProperty?.id === property.id}
                    onSelect={setSelectedProperty}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Add New Property</h3>
                  <Sparkles size={20} className="text-slate-500" />
                </div>
                <form className="mt-4 space-y-3 text-sm" onSubmit={handleCreateProperty}>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">Property name</label>
                    <input
                      value={formState.name}
                      onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="ABC"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">Type</label>
                    <select
                      value={formState.type}
                      onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="PG">PG</option>
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={formState.address.pincode}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          address: { ...prev.address, pincode: event.target.value },
                        }))
                      }
                      placeholder="Pincode"
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                    <input
                      value={formState.address.city}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, address: { ...prev.address, city: event.target.value } }))
                      }
                      placeholder="City"
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                  </div>
                  <input
                    value={formState.address.addressLine1}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, address: { ...prev.address, addressLine1: event.target.value } }))
                    }
                    placeholder="Address Line 1"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                  <input
                    value={formState.address.addressLine2}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, address: { ...prev.address, addressLine2: event.target.value } }))
                    }
                    placeholder="Address Line 2"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-900">Add pictures</p>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Drop images</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
                    <select
                      value={formState.status}
                      onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Non-A</option>
                      <option value="LOGICALLY_DELETED">L.Delete</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          name: '',
                          type: 'Apartment',
                          imageUrls: '',
                          address: { pincode: '', city: '', addressLine1: '', addressLine2: '', country: 'India', state: 'Karnataka' },
                          status: 'ACTIVE',
                        })
                      }
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={working}
                      className="flex-1 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
              <DuplicateCheckPanel onRunCheck={handleDuplicateCheck} lastResult={duplicateResult} />
            </div>
          </section>
          {statusMessage && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
              {statusMessage}
            </div>
          )}
          {selectedProperty && (
            <PropertyDetails
              property={selectedProperty}
              units={units}
              onAddUnit={handleAddUnit}
              onLogicalDelete={handleLogicalDelete}
              onHardDelete={handleHardDelete}
            />
          )}
          {showUnitsInput && (
            <AddUnitsInput
              onCreate={(data) => handleCreateUnit({ ...data })}
              onCancel={() => setShowUnitsInput(false)}
            />
          )}
          <DeleteModal
            open={deleteFlow.logical}
            title="Logical Delete"
            description="Property safely hidden"
            onClose={() => setDeleteFlow((prev) => ({ ...prev, logical: false }))}
            onConfirm={confirmLogicalDelete}
          >
            <p>Logical delete hides the property and freezes data. Nothing is removed.</p>
            <ul className="list-disc pl-5 text-xs text-slate-600">
              <li>Check 1: No active tenants (placeholder)</li>
              <li>Check 2: No outstanding balance (placeholder)</li>
            </ul>
          </DeleteModal>
          <DeleteModal
            open={deleteFlow.hard}
            title="Hard Delete"
            description="Property & all units"
            onClose={() => {
              setDeleteFlow((prev) => ({ ...prev, hard: false }));
              setHardDeletePhrase('');
            }}
            onConfirm={confirmHardDelete}
            disableConfirm={hardDeletePhrase !== expectedHardDeletePhrase}
          >
            <p>This action permanently removes the property. Type DELETE {selectedProperty?.name} to confirm.</p>
            <input
              value={hardDeletePhrase}
              onChange={(event) => setHardDeletePhrase(event.target.value)}
              placeholder={`DELETE ${selectedProperty?.name ?? ''}`}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </DeleteModal>
        </main>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
