// Matches backend enum `VehicleClass` (rental_core.vehicle.vehicle_class)
export const VEHICLE_CLASS_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
  { value: 'bus', label: 'Bus' },
  { value: 'truck', label: 'Truck' },
  { value: 'lorry', label: 'Lorry' },
  { value: 'bike', label: 'Bike' },
  { value: 'tuktuk', label: 'Tuk Tuk' },
];

// Vehicle classes that carry cargo instead of (or in addition to) passengers
export const CARGO_VEHICLE_CLASSES = ['van', 'truck', 'lorry'];

// Matches backend enum `VehicleStatus` (rental_core.vehicle.status)
export const VEHICLE_STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: 'success' },
  { value: 'reserved', label: 'Reserved', color: 'info' },
  { value: 'rented', label: 'Rented', color: 'warning' },
  { value: 'maintenance', label: 'Maintenance', color: 'error' },
  { value: 'retired', label: 'Retired', color: 'default' },
];

export const VEHICLE_STATUSES = VEHICLE_STATUS_OPTIONS.map((option) => option.value);

// `fuel_type` / `transmission` are free-text columns on the backend; these are just
// the common values offered in the UI, the field still accepts custom values.
export const FUEL_TYPE_OPTIONS = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
  { value: 'cng', label: 'CNG' },
];

export const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

export const VEHICLE_MAKES = [
  'Toyota',
  'Honda',
  'BMW',
  'Mercedes',
  'Suzuki',
  'Nissan',
  'Hyundai',
  'Mitsubishi',
  'Isuzu',
  'Ford',
  'Kia',
];

// Matches backend enum for `rental_core.vehicle_document.doc_type`
export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'registration', label: 'Registration (CR Book)' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'revenue_license', label: 'Revenue License' },
  { value: 'emission_test', label: 'Emission Test' },
  { value: 'permit', label: 'Permit' },
  { value: 'other', label: 'Other' },
];

// Matches backend enum for `rental_ops.maintenance_record.maint_type`
export const MAINTENANCE_TYPE_OPTIONS = [
  { value: 'service', label: 'Service' },
  { value: 'repair', label: 'Repair' },
  { value: 'tire_change', label: 'Tire Change' },
  { value: 'battery', label: 'Battery' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

// A document with no expiry_date (e.g. a permit that doesn't expire) is always "valid".
const DOC_EXPIRY_WARNING_DAYS = 30;

export function getDocumentExpiryStatus(expiryDate) {
  if (!expiryDate) return { label: 'No expiry', color: 'default' };

  const diffDays = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Expired', color: 'error', diffDays };

  if (diffDays <= DOC_EXPIRY_WARNING_DAYS) {
    return { label: `Expires in ${diffDays}d`, color: 'warning', diffDays };
  }

  return { label: 'Valid', color: 'success', diffDays };
}

const MAINTENANCE_DUE_WARNING_KM = 1000;
const MAINTENANCE_DUE_WARNING_DAYS = 14;

// A record is "due" if either the odometer or the date threshold has been reached -
// whichever comes first, mirroring how service intervals work in practice.
export function getMaintenanceDueStatus(record, currentOdometer) {
  const { next_due_odometer: dueOdo, next_due_date: dueDate } = record;

  if (!dueOdo && !dueDate) return { label: 'No schedule', color: 'default' };

  const kmRemaining = dueOdo ? dueOdo - (currentOdometer ?? 0) : null;
  const daysRemaining = dueDate
    ? Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = (kmRemaining !== null && kmRemaining <= 0) || (daysRemaining !== null && daysRemaining <= 0);
  if (isOverdue) return { label: 'Overdue', color: 'error' };

  const isDueSoon =
    (kmRemaining !== null && kmRemaining <= MAINTENANCE_DUE_WARNING_KM) ||
    (daysRemaining !== null && daysRemaining <= MAINTENANCE_DUE_WARNING_DAYS);
  if (isDueSoon) return { label: 'Due soon', color: 'warning' };

  return { label: 'On schedule', color: 'success' };
}
